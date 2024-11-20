import { ExpenseCancelTransactionDto } from '../dto/expense/expenseCanceltransaction.dto';
import { ExpenseCheckPerformTransactionDto } from '../dto/expense/expenseCheckPerformTransaction.dto';
import { ExpenseCheckTransactionDto } from '../dto/expense/expenseCheckTransaction.dto';
import { ExpenseCreateTransactionDto } from '../dto/expense/expenseCreateTransaction.dto';
import { ExpenseGetStatementDto } from '../dto/expense/expenseGetStatement.dto';
import { ExpensePerformTransactionDto } from '../dto/expense/expensePerformTransaction.dto';


export type ExpenseRequestBody =
    | ExpenseCancelTransactionDto
    | ExpenseCheckPerformTransactionDto
    | ExpenseCheckTransactionDto
    | ExpenseCreateTransactionDto
    | ExpenseGetStatementDto
    | ExpensePerformTransactionDto;