import { PAYMENTSYSTEM } from 'src/enum/system.enum';
import { ClickRequestDto } from '../dto/click-request.dto';
import { GenerateMd5HashParams } from '../interfaces/generate-prepare-hash.interface';
import { ClickError } from 'src/enum/Payment.enum';
import { TransactionActions } from '../constants/transaction-action';
import { TransactionStatus } from 'src/utils/constants/proliga-status';

export async function prepareExpense(this: any, clickReqBody: ClickRequestDto) {
  const merchantTransId = clickReqBody.merchant_trans_id;
  const amount = clickReqBody.amount;
  const transId = clickReqBody.click_trans_id;
  const serviceId = clickReqBody.service_id;
  const signString = clickReqBody.sign_string;
  const action = clickReqBody.action;
  const signTime = clickReqBody.sign_time;
  const time = new Date(Date.now());
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

  if (!teamId || typeof Number(teamId) !== 'number') {
    return {
      error: ClickError.BadRequest,
      error_note: 'Invalid team_id, team_id must be number',
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

  const existingPackage = await this.prismaService.pay_package.findUnique({
    where: {
      id: Number(packageId),
    },
  });

  if (!existingPackage) {
    return {
      error: ClickError.BadRequest,
      error_note: 'Invalid package_id',
    };
  }

  if (amount !== existingPackage?.price) {
    return {
      error: ClickError.InvalidAmount,
      error_note: 'Invalid amount',
    };
  }

  const existingTransaction = await this.prismaService.pay_expense.findUnique({
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

  await this.prismaService.pay_expense.create({
    data: {
      team_id: Number(teamId),
      pay_package_id: Number(packageId),
      transaction_id: transId.toString(),
      status: TransactionActions.Prepare,
      system: PAYMENTSYSTEM.CLICK,
      price: amount,
      created_at: time,
      updated_at: time,
    },
  });

  return {
    click_trans_id: Number(transId),
    merchant_trans_id: merchantTransId,
    merchant_prepare_id: time.getDate(),
    error: ClickError.Success,
    error_note: 'Success',
  };
}
