import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { PaymeError } from '../constants/payme-error';
import { TransactionState } from '../constants/transaction-state';
import { CheckPerformTransactionDto } from '../dto/check-perform-transaction.dto';
import { TransactionMethods } from '../constants/transaction-methods';
import { ErrorStatusCodes } from '../constants/error-status-codes';

export async function createTransaction(
  this: any,
  createTransactionDto: CreateTransactionDto,
) {
  const userId = Number(createTransactionDto.params?.account?.user_id);
  const amount = createTransactionDto.params.amount;
  if (!userId) {
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

  const subid = await this.prismaService.usersub.findFirst({
    where: { id: userId },
  });
  if (!subid || !subid.subs_id) {
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
  const sub_id = subid.subs_id;
  const balance = await this.prismaService.subscribtion.findFirst({
    where: { id: sub_id, price: amount },
  });

  if (!balance) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAmount,
        message: {
          ru: 'Неверная сумма',
          uz: 'Incorrect amount',
          en: 'Incorrect amount',
        },
      },
    };
  }

  if (typeof balance.price !== 'number' || balance.price < amount / 100) {
    return { error: PaymeError.InsufficientFunds };
  }

  const transId = await this.prismaService.pay_balance.findUnique({
    where: { transaction_id: createTransactionDto.params.id },
  });
  console.log('transId', transId);

  if (transId) {
    if (transId.status !== 'pending') {
      return {
        error: PaymeError.CantDoOperation,
        id: transId.transaction_id,
      };
    }
    return {
      result: {
        balance: transId.price,
        transaction: transId.transaction_id,
        state: TransactionState.Pending,
        create_time: new Date(transId.created_at).getTime(),
      },
    };
  }

  const checkTransaction: CheckPerformTransactionDto = {
    method: TransactionMethods.CheckPerformTransaction,
    params: {
      amount: balance.price,
      account: {
        user_id: userId?.toString(),
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

  const newTransaction = await this.prismaService.pay_balance.create({
    data: {
      user_id: userId,
      price: balance.price,
      transaction_id: createTransactionDto.params.id,
      state: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return {
    result: {
      balance: newTransaction.price,
      transaction: newTransaction.transaction_id,
      state: TransactionState.Pending,
      create_time: new Date(newTransaction.created_at).getTime(),
    },
  };
}
