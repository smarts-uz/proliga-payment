import { TransactionStatus } from '../constants/status-codes';
import { ClickRequestDto } from '../dto/click-request.dto';
import { GenerateMd5HashParams } from '../interfaces/generate-prepare-hash.interface';
import { ClickError } from 'src/enum/Payment.enum';

export async function complete(this: any, clickReqBody: ClickRequestDto) {
  const userId = clickReqBody.merchant_trans_id;
  const amount = clickReqBody.amount;
  const transId = clickReqBody.click_trans_id;
  const signString = clickReqBody.sign_string;
  const action = clickReqBody.action;
  const signTime = clickReqBody.sign_time;
  const serviceId = clickReqBody.service_id;

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
  console.log(myMD5Hash, 'myMD5hash');

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

  const isPreparedTransaction = await this.prismaService.pay_balance.findUnique(
    {
      where: {
        transaction_id: transId?.toString(),
      },
    },
  );

  if (!isPreparedTransaction) {
    return {
      error: ClickError.TransactionNotFound,
      error_note: 'Invalid merchant_prepare_id',
    };
  }

  if (isPreparedTransaction?.status === TransactionStatus.Paid) {
    return {
      error: ClickError.AlreadyPaid,
      error_note: 'Already paid',
    };
  }

  if (clickReqBody.error > 0) {
    await this.prismaService.pay_balance.update({
      where: {
        id: isPreparedTransaction.id,
      },
      data: {
        status: TransactionStatus.Canceled,
      },
    });
    return {
      error: clickReqBody.error,
      error_note: 'Failed',
    };
  }

  await this.prismaService.pay_balance.update({
    where: {
      id: isPreparedTransaction.id,
    },
    data: {
      status: TransactionStatus.Paid,
    },
  });

  return {
    click_trans_id: Number(transId),
    merchant_trans_id: userId,
    error: ClickError.Success,
    error_note: 'Success',
  };
}
