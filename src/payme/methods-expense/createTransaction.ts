import { CreateExpenseTransactionDto } from '../dto/create-transaction.dto';
import { PaymeError } from '../constants/payme-error';
import { TransactionState } from '../constants/transaction-state';
import { CheckPerformExpenseTransactionDto } from '../dto/check-perform-transaction.dto';
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

  if (!team_id || !package_id) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAuthorization,
        message: {
          uz: 'Malumot yetarli emas',
          en: 'Not enough data',
          ru: 'Недостаточно данных',
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
  if (!selectedPackage) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotAllowed,
        message: {
          uz: 'Paket topilmadi',
          en: 'Package does not exist',
          ru: 'Пакет не существует',
        },
      },
    };
  }

  if (selectedPackage.price * 100 !== amount) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAmount,
        message: {
          uz: 'Paket narxi noto`g`ri',
          en: 'Package price is not correct',
          ru: 'Сумма не соответствует пакету',
        },
      },
    };
  }

  const transaction = await this.prismaService.pay_expense.findUnique({
    where: { transaction_id },
  });

  if (transaction) {
    if (Number(transaction.status) !== TransactionStatus.PENDING) {
      return {
        error: PaymeError.CantDoOperation,
        id: transaction.transaction_id,
      };
    }
    return {
      result: {
        balance: Number(transaction.price),
        transaction: transaction.transaction_id,
        state: TransactionState.Pending,
        create_time: new Date(transaction.created_at).getTime(),
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

  const checkResult =
    await this.checkPerformExpenseTransaction(checkTransaction);

  if (checkResult.error) {
    return {
      error: checkResult.error,
      id: transaction?.transaction_id,
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
      price: selectedPackage.price,
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
