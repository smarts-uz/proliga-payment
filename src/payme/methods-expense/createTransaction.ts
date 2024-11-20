import {
  CreateExpenseTransactionDto,
  CreateTransactionDto,
} from '../dto/create-transaction.dto';
import { PaymeError } from '../constants/payme-error';
import { TransactionState } from '../constants/transaction-state';
import {
  CheckPerformExpenseTransactionDto,
  CheckPerformTransactionDto,
} from '../dto/check-perform-transaction.dto';
import { TransactionMethods } from '../constants/transaction-methods';
import { ErrorStatusCodes } from '../constants/error-status-codes';
import { pay_system } from '@prisma/client';
import { TransactionStatus } from 'src/utils/constants/proliga-status';

export async function createExpenseTransaction(
  this: any,
  createTransactionDto: CreateExpenseTransactionDto,
) {
  const team_id = Number(createTransactionDto.params?.account?.team_id);
  const package_id = Number(createTransactionDto.params?.account?.package_id);
  const amount = createTransactionDto.params.amount;
  const transaction_id = createTransactionDto.params.id;

  if (!team_id || package_id) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAuthorization,
        message: {
          uz: 'Noto‘g‘ri avtorizatsiya',
          en: 'Invalid authorization',
          ru: 'Неверная авторизация',
        },
      },
    };
  }

  const user = await this.prismaService.team.findUnique({
    where: { id: team_id },
  });

  if (!user) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotAllowed,
        message: {
          uz: "Foydalanuvchi balansi yo'q",
          en: 'User balance does not exist',
          ru: 'Баланс пользователя не существует',
        },
      },
    };
  }
  const selectedPackage = await this.prismaService.pay_package.findUnique({
    where: { id: package_id },
  });

  const transId = await this.prismaServic.pay_expense.findUnique({
    where: { transaction_id },
  });

  if (transId) {
    if (Number(transId.status) !== TransactionState.Pending) {
      return {
        error: PaymeError.CantDoOperation,
        id: transId.transaction_id,
      };
    }
    return {
      result: {
        balance: Number(transId.price),
        transaction: transId.transaction_id,
        state: TransactionState.Pending,
        create_time: new Date(transId.created_at).getTime(),
      },
    };
  }

  const checkTransaction: CheckPerformExpenseTransactionDto = {
    method: TransactionMethods.CheckPerformTransaction,
    params: {
      amount,
      account: {
        team_id: team_id.toString(),
        package_id: package_id.toString(),
      },
    },
  };

  const checkResult = await this.checkPerformTransaction(checkTransaction);

  if (checkResult.error) {
    return {
      error: checkResult.error,
      id: transId?.transaction_id,
    };
  }

  const {
    price,
    transaction_id: transactionId,
    created_at,
  } = await this.prismaService.pay_expense.create({
    data: {
      team_id,
      pay_package_id: package_id,
      price: amount / 100,
      transaction_id,
      state: TransactionState.Pending,
      status: TransactionStatus.PENDING,
      system: pay_system.payme,
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
    },
  });

  return {
    result: {
      balance: Number(price), // Big Int => Number,
      transaction: transactionId,
      state: TransactionState.Pending,
      create_time: new Date(created_at).getTime(),
    },
  };
}
