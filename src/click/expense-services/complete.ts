import { ClickRequestDto } from '../dto/click-request.dto';
import { GenerateMd5HashParams } from '../interfaces/generate-prepare-hash.interface';
import { ClickError } from 'src/enum/Payment.enum';
import { TransactionStatus } from 'src/utils/constants/proliga-status';

export async function completeExpense(
  this: any,
  clickReqBody: ClickRequestDto,
) {
  const merchantTransId = clickReqBody.merchant_trans_id;
  const amount = clickReqBody.amount;
  const transId = clickReqBody.click_trans_id;
  const serviceId = clickReqBody.service_id;
  const signString = clickReqBody.sign_string;
  const action = clickReqBody.action;
  const signTime = clickReqBody.sign_time;
  const teamId = merchantTransId.split('-')[0];
  const packageId = merchantTransId.split('-')[1];

  const myMD5Params: GenerateMd5HashParams = {
    clickTransId: transId,
    secretKey: process.env.CLICK_EXPENSE_SECRET,
    merchantTransId,
    serviceId,
    amount,
    action,
    signTime,
  };

  const myMD5Hash = this.hashingService.generateMD5(myMD5Params);

  await this.prismaService.pay_signs.create({
    data: {
      key: (teamId + '-' + packageId + '-' + action).toString(),
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

  const existingTeam = await this.prismaService.team.findUnique({
    where: {
      id: Number(teamId),
    },
  });

  if (!existingTeam) {
    return {
      error: ClickError.UserNotFound,
      error_note: 'Invalid team_id',
    };
  }

  const isPreparedTransaction = await this.prismaService.pay_expense.findUnique(
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

  if (isPreparedTransaction?.status === TransactionStatus.PAID) {
    return {
      error: ClickError.AlreadyPaid,
      error_note: 'Already paid',
    };
  }

  if (clickReqBody.error > 0) {
    await this.prismaService.pay_expense.update({
      where: {
        id: isPreparedTransaction.id,
      },
      data: {
        status: TransactionStatus.CANCELLED,
      },
    });
    return {
      error: clickReqBody.error,
      error_note: 'Failed',
    };
  }

  await this.prismaService.pay_expense.update({
    where: {
      id: isPreparedTransaction.id,
    },
    data: {
      status: TransactionStatus.PAID,
    },
  });

  return {
    click_trans_id: Number(transId),
    merchant_trans_id: merchantTransId,
    error: ClickError.Success,
    error_note: 'Success',
  };
}
