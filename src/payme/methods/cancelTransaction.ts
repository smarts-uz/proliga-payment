import { CancelTransactionDto } from '../dto/cancel-transaction.dto';
import { TransactionState } from '../constants/transaction-state';
import { ErrorStatusCodes } from '../constants/error-status-codes';
import * as console from 'node:console';

export async function cancelTransaction(
  this: any,
  cancelTransactionDto: CancelTransactionDto,
) {
  const transId = cancelTransactionDto.params.id;

  const transaction = await this.prismaService.pay_balance.findUnique({
    where: { transaction_id: transId },
  });

  if (transaction.status === TransactionState.Paid) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotFound,
        message: 'Transaction already paid ',
      },
    };
  }

  if (!transaction) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAuthorization,
        message: {
          uz: 'Transacsiya topilmadi',
          en: 'Transaction not found ',
          ru: 'Неверная transaction',
        },
      },
    };
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
        transaction: canceledTransaction.transaction_id.toString(),
        state: TransactionState.PendingCanceled,
      },
    };
  }


  return {
    result: {
      state: transaction.state,
      transaction: transaction.transaction_id.toString(),
      cancel_time: new Date(transaction.canceled_at).getTime(),
    },
  };
}
