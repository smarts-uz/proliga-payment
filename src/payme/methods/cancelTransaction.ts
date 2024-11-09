import { CancelTransactionDto } from '../dto/cancel-transaction.dto';
import { TransactionState } from '../constants/transaction-state';
import { PaymeError } from '../constants/payme-error';

export async function cancelTransaction(
  this: any,
  cancelTransactionDto: CancelTransactionDto,
) {
  const transId = cancelTransactionDto.params.id;

  const transaction = await this.prismaService.pay_balance.findUnique({
    where: { id: Number(transId) },
  });

  if (!transaction) {
    return { id: transId, error: PaymeError.TransactionNotFound };
  }

  if (transaction.state === TransactionState.Pending) {
    const canceledTransaction = await this.prismaService.pay_balance.update({
      where: { id: transaction.id },
      data: {
        status: TransactionState.PaidCanceled,
        state: TransactionState.PendingCanceled,
        canceled_at: new Date(),
        reason: cancelTransactionDto.params.reason,
      },
    });

    return {
      result: {
        cancel_time: canceledTransaction.canceled_at?.getTime(),
        transaction: canceledTransaction.id,
        state: TransactionState.PendingCanceled,
      },
    };
  }

  return {
    result: {
      state: transaction.state,
      transaction: transaction.id,
      cancel_time: transaction.canceled_at?.getTime(),
    },
  };
}
