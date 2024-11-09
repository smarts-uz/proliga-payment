import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { PaymeError } from '../constants/payme-error';
import { TransactionState } from '../constants/transaction-state';
import { CancelingReasons } from '../payme.service';
import { CheckPerformTransactionDto } from '../dto/check-perform-transaction.dto';
import { TransactionMethods } from '../constants/transaction-methods';

export async function createTransaction(
  this: any,
  createTransactionDto: CreateTransactionDto,
) {
  const userId = Number(createTransactionDto.params?.account?.user_id);
  const amount = createTransactionDto.params.amount;

  const balance = await this.prismaService.subscribtion.findUnique({
    where: { id: userId },
  });

  if (
    !balance ||
    typeof balance.price !== 'number' ||
    balance.price < amount / 100
  ) {
    return { error: PaymeError.InsufficientFunds };
  }

  const transid = await this.prismaService.pay_balance.findFirst({
    where: { transaction_id: createTransactionDto.params.id },
  });

  if (transid != null) {
    if (transid.status !== 'pending') {
      return {
        error: PaymeError.CantDoOperation,
        id: transid.transaction_id,
      };
    }
    if (this.checkTransactionExpiration(transid.created_at)) {
      await this.prismaService.pay_balance.update({
        where: { id: transid.id },
        data: {
          status: 'canceled',
          canceled_at: new Date(),
          state: TransactionState.PendingCanceled,
        },
      });

      return {
        error: {
          ...PaymeError.CantDoOperation,
          state: TransactionState.PendingCanceled,
          reason: CancelingReasons.CanceledDueToTimeout,
        },
        id: transid.transaction_id,
      };
    }

    return {
      result: {
        balance: transid.price,
        transaction: transid.transaction_id,
        state: TransactionState.Pending,
        create_time: new Date(transid.created_at).getTime(),
      },
    };
  }

  const checkTransaction: CheckPerformTransactionDto = {
    method: TransactionMethods.CheckPerformTransaction,
    params: {
      amount: balance.price * 100,
      account: {
        user_id: userId.toString(),
      },
    },
  };

  const checkResult = await this.checkPerformTransaction(checkTransaction);
  console.log(checkResult);

  if (checkResult.error) {
    return {
      error: checkResult.error,
      id: transid.transaction_id,
    };
  }

  const newTransaction = await this.prismaService.pay_balance.create({
    data: {
      user_id: userId,
      price: balance.price - amount, // Deducting the amount from the user's current balance
      transaction_id: createTransactionDto.params.id, 
      state: 1, 
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return {
    result: {
      balance: newTransaction.price,
      transaction: createTransactionDto.params.id,
      state: TransactionState.Pending,
      create_time: new Date(newTransaction.created_at).getTime(),
    },
  };
}
