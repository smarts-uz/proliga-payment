import { BalanceCancelTransactionDto } from '../dto/balance/cancel-transaction.dto';
import { BalanceCheckPerformTransactionDto } from '../dto/balance/check-perform-transaction.dto';
import { BalanceCheckTransactionDto } from '../dto/balance/check-transaction.dto';
import { BalanceCreateTransactionDto } from '../dto/balance/create-transaction.dto';
import { BalanceGetStatementDto } from '../dto/balance/get-statement.dto';
import { BalancePerformTransactionDto } from '../dto/balance/perform-transaction.dto';

import { ExpenseCancelTransactionDto } from '../dto/expense/expenseCanceltransaction.dto';
import { ExpenseCheckPerformTransactionDto } from '../dto/expense/expenseCheckPerformTransaction.dto';
import { ExpenseCheckTransactionDto } from '../dto/expense/expenseCheckTransaction.dto';
import { ExpenseCreateTransactionDto } from '../dto/expense/expenseCreateTransaction.dto';
import { ExpenseGetStatementDto } from '../dto/expense/expenseGetStatement.dto';
import { ExpensePerformTransactionDto } from '../dto/expense/expensePerformTransaction.dto';

export type RequestBody =
  | BalanceCancelTransactionDto
  | BalanceCheckPerformTransactionDto
  | BalanceCheckTransactionDto
  | BalanceCreateTransactionDto
  | BalanceGetStatementDto
  | BalancePerformTransactionDto
  | ExpenseCancelTransactionDto
  | ExpenseCheckPerformTransactionDto
  | ExpenseCheckTransactionDto
  | ExpenseCreateTransactionDto
  | ExpenseGetStatementDto
  | ExpensePerformTransactionDto;
