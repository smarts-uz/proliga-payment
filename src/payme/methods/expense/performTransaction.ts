import { ExpensePerformTransactionDto } from "../../dto/expense/expensePerformTransaction.dto";
import { PaymeError } from '../../constants/payme-error';
import { TransactionState } from '../../constants/transaction-state';
import { CancelingReasons } from '../../constants/canceling-reasons';
import { ErrorStatusCodes } from '../../constants/error-status-codes';

export async function ExpensePerformTransaction(
  this: any,
  performTransactionDto: ExpensePerformTransactionDto,
) {
  const transaction = await this.prismaService.pay_expense.findUnique({
    where: { transaction_id: performTransactionDto.params.id },
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

  if (transaction.state !== TransactionState.Pending) {
    if (transaction.state !== TransactionState.Paid) {
      // Make sure transaction status is PAID
      return {
        error: PaymeError.CantDoOperation,
        id: performTransactionDto.params.id,
      };
    }

    return {
      result: {
        state: transaction.state,
        transaction: transaction.transaction_id.toString(),
        perform_time: transaction.perform_time
          ? new Date(transaction.perform_time).getTime()
          : null,
      },
    };
  }

  const isExpired = this.checkTransactionExpiration(transaction.created_at);

  if (isExpired) {
    await this.prismaService.pay_expense.update({
      where: { id: transaction.id },
      data: {
        status: TransactionState.PendingCanceled.toString(),
        canceled_at: new Date(Date.now()),
        state: TransactionState.PendingCanceled,
        reason: Number(CancelingReasons.CanceledDueToTimeout),
      },
    });

    return {
      error: {
        state: TransactionState.PendingCanceled,
        reason: CancelingReasons.CanceledDueToTimeout,
        ...PaymeError.CantDoOperation,
      },
      id: performTransactionDto.params.id,
    };
  }

  const updatedTransaction = await this.prismaService.pay_expense.update({
    where: { id: transaction.id },
    data: {
      status: TransactionState.Paid.toString(),
      state: TransactionState.Paid,
      perform_time: new Date(Date.now()),
    },
  });

  return {
    result: {
      transaction: updatedTransaction.transaction_id.toString(),
      perform_time: updatedTransaction.perform_time.getTime(),
      state: TransactionState.Paid,
    },
  };
}
