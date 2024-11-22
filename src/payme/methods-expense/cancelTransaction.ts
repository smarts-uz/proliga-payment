import { CancelTransactionDto } from '../dto/cancel-transaction.dto';
import { TransactionState } from '../constants/transaction-state';
import { ErrorStatusCodes } from '../constants/error-status-codes';
import { TransactionStatus } from 'src/utils/constants/proliga-status';
import { CancelingReasons } from '../constants/canceling-reasons';

export async function cancelExpenseTransaction(
  this: any,
  cancelTransactionDto: CancelTransactionDto,
) {
  const transId = cancelTransactionDto.params.id;
  console.log(cancelTransactionDto.params)
  const reason = Number(cancelTransactionDto.params?.reason);

  const transaction = await this.prismaService.pay_expense.findUnique({
    where: { transaction_id: transId },
  });

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

  if (Number(transaction.status) === TransactionState.Paid) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotFound,
      },
    };
  }

  if (transaction.state === TransactionState.Pending) {
    const canceledTransaction = await this.prismaService.pay_expense.update({
      where: { id: transaction?.id },
      data: {
        status: TransactionStatus.CANCELLED,
        state: TransactionState.PendingCanceled,
        canceled_at: new Date(Date.now()),
        reason: cancelTransactionDto.params.reason,
      },
    });
    return {
      result: {
        state: TransactionState.PendingCanceled,
        cancel_time: canceledTransaction.canceled_at?.getTime(),
        transaction: canceledTransaction.transaction_id.toString(),
      },
    };
  }
  if (reason === CancelingReasons.Refund) {
    const canceledTransaction = await this.prismaService.pay_expense.update({
      where: { id: transaction?.id },
      data: {
        status: TransactionStatus.CANCELLED,
        state: TransactionState.PendingCanceled,
        canceled_at: transaction?.canceled_at ? transaction.canceled_at : new Date(Date.now()),
        reason: cancelTransactionDto.params.reason,
      },
    });

    return {
      result: {
        state: TransactionState.PaidCanceled,
        cancel_time: canceledTransaction.canceled_at?.getTime(),
        transaction: canceledTransaction.transaction_id.toString(),
      },
    };
  }
  return {
    result: {
      state: transaction.state,
      transaction: transaction.transaction_id.toString(),
      cancel_time: transaction.canceled_at?.getTime(),
    },
  };
}
