import { BalanceCreateTransactionDto } from '../../dto/balance/create-transaction.dto';
import { PaymeError } from '../../constants/payme-error';
import { TransactionState } from '../../constants/transaction-state';
import { BalanceCheckPerformTransactionDto } from '../../dto/balance/check-perform-transaction.dto';
import { TransactionMethods } from '../../constants/transaction-methods';
import { ErrorStatusCodes } from '../../constants/error-status-codes';
import { pay_system } from '@prisma/client';

export async function BalanceCreateTransaction(
  this: any,
  createTransactionDto: BalanceCreateTransactionDto,
) {
  const user_id = Number(createTransactionDto.params?.account?.user_id);
  const amount = createTransactionDto.params.amount;
  const transaction_id = createTransactionDto.params.id;

  if (!user_id) {
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

  const user = await this.prismaService.user.findUnique({
    where: { id: user_id },
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

  const transId = await this.prismaService.pay_balance.findUnique({
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

  const checkTransaction: BalanceCheckPerformTransactionDto = {
    method: TransactionMethods.BalanceCheckPerformTransaction,
    params: {
      amount: amount,
      account: {
        user_id: user_id.toString(),
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
  } = await this.prismaService.pay_balance.create({
    data: {
      user_id,
      price: amount,
      transaction_id,
      state: TransactionState.Pending,
      status: TransactionState.Pending.toString(),
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
