import { PAYMENTSYSTEM } from 'src/enum/system.enum';
import { ClickRequestDto } from '../dto/click-request.dto';
import { GenerateMd5HashParams } from '../interfaces/generate-prepare-hash.interface';
import { ClickError } from 'src/enum/Payment.enum';
import { TransactionStatus } from 'src/utils/constants/proliga-status';

export async function prepare(this: any, clickReqBody: ClickRequestDto) {
  const userId = clickReqBody.merchant_trans_id;
  const amount = clickReqBody.amount;
  const transId = clickReqBody.click_trans_id;
  const serviceId = clickReqBody.service_id;
  const signString = clickReqBody.sign_string;
  const action = clickReqBody.action;
  const signTime = clickReqBody.sign_time;
  const time = new Date(Date.now());

  const myMD5Params: GenerateMd5HashParams = {
    clickTransId: transId,
    secretKey: this.secretKey,
    merchantTransId: userId,
    serviceId,
    amount,
    action,
    signTime,
  };

  const myMD5Hash = this.hashingService.generateMD5(myMD5Params);

  await this.prismaService.pay_signs.create({
    data: {
      key: (userId + '-' + action).toString(),
      value: myMD5Hash,
    },
  });

  if (
    signString !== myMD5Hash &&
    Boolean(process.env.CLICK_CHECK_SIGN_STRING)
  ) {
    return {
      error: ClickError.SignFailed,
      error_note: 'Invalid sign_string',
    };
  }
  if (!userId || /\d+/.test(userId)) {
    return {
      error: ClickError.BadRequest,
      error_note: 'Invalid user_id, user_id must be number',
    };
  }

  const user = await this.prismaService.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    return {
      error: ClickError.UserNotFound,
      error_note: 'Invalid userId',
    };
  }

  const existingTransaction = await this.prismaService.pay_balance.findUnique({
    where: {
      transaction_id: transId.toString(),
    },
  });

  if (existingTransaction?.status === TransactionStatus.PAID) {
    return {
      error: ClickError.AlreadyPaid,
      error_note: 'Already paid',
    };
  }

  if (existingTransaction?.status === TransactionStatus.CANCELLED) {
    return {
      error: ClickError.TransactionCanceled,
      error_note: 'Cancelled',
    };
  }
  if (existingTransaction) {
    return {
      error: ClickError.AlreadyPaid,
      error_note: 'Transaction ID already exists.',
    };
  }

  await this.prismaService.pay_balance.create({
    data: {
      user_id: Number(userId),
      transaction_id: transId.toString(),
      status: TransactionStatus.PENDING,
      system: PAYMENTSYSTEM.CLICK,
      price: amount,
      created_at: time,
      updated_at: time,
    },
  });

  return {
    click_trans_id: Number(transId),
    merchant_trans_id: userId,
    merchant_prepare_id: time.getDate(),
    error: ClickError.Success,
    error_note: 'Success',
  };
}
