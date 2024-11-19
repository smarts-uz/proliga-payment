import { ExpenseCancelTransactionDto } from "../../dto/expense/expenseCanceltransaction.dto";
import { TransactionState } from '../../constants/transaction-state';
import { ErrorStatusCodes } from '../../constants/error-status-codes';

export async function ExpenseCancelTransaction(
  this: any,
  cancelTransactionDto: ExpenseCancelTransactionDto,
) {
  const transId = cancelTransactionDto.params.id;

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
        status: TransactionState.PaidCanceled.toString(),
        state: TransactionState.PendingCanceled,
        canceled_at: new Date(Date.now()),
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
      cancel_time: transaction.canceled_at?.getTime(),
    },
  };
}
