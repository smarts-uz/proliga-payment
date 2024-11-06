import { TransactionStatus } from '../constants/status-codes';
import { ClickRequestDto } from '../dto/click-request.dto';
import { GenerateMd5HashParams } from '../interfaces/generate-prepare-hash.interface';
import { ClickError } from 'src/enum/Payment.enum';

export async function complete(this: any, clickReqBody: ClickRequestDto) {
  const serviceId = Number(process.env.CLICK_SERVICE_ID);

  const merchantTransId = clickReqBody.merchant_trans_id;
  const userId = clickReqBody.user_id;
  const amount = clickReqBody.amount;
  const transId = clickReqBody.click_trans_id;
  const signString = clickReqBody.sign_string;
  const action = clickReqBody.action;
  const signTime = clickReqBody.sign_time;

  const myMD5Params: GenerateMd5HashParams = {
    clickTransId: transId,
    secretKey: this.secretKey,
    merchantTransId,
    serviceId,
    amount,
    action,
    signTime,
  };

  const myMD5Hash = this.hashingService.generateMD5(myMD5Params);
  // if (signString !== myMD5Hash) {
  //   return {
  //     error: ClickError.SignFailed,
  //     error_note: 'Invalid sign_string',
  //   };
  // }

  const isValidUserId = this.checkObjectId(userId);

  if (!isValidUserId) {
    return {
      error: ClickError.BadRequest,
      error_note: 'Invalid user_id, user_id must be number',
    };
  }

  const user = await this.prismaService.pay_balance.findUnique({
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

  const isPrepared = await this.prismaService.pay_balance.findFirst({
    where: {
      user_id: Number(userId),
    },
  });
  console.log(amount, isPrepared.price);

  if (!isPrepared) {
    return {
      error: ClickError.TransactionNotFound,
      error_note: 'Invalid merchant_prepare_id',
    };
  }

  const isAlreadyPaid = await this.prismaService.pay_balance.findFirst({
    where: {
      transaction_id: transId,
      status: TransactionStatus.Paid,
    },
  });

  if (isAlreadyPaid) {
    return {
      error: ClickError.AlreadyPaid,
      error_note: 'Already paid',
    };
  }

  // if (amount !== isPrepared.price) {
  //   return {
  //     error: ClickError.InvalidAmount,
  //     error_note: 'Invalid price',
  //   };
  // }

  if (clickReqBody.error > 0) {
    await this.prismaService.pay_balance.update({
      where: {
        id: isPrepared.id,
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
      id: isPrepared.id,
    },
    data: {
      status: TransactionStatus.Paid,
    },
  });

  return {
    click_trans_id: Number(transId),
    merchant_trans_id: merchantTransId,
    error: ClickError.Success,
    error_note: 'Success',
  };
}
