import { BalanceCancelTransactionDto } from '../dto/balance/cancel-transaction.dto';
import { BalanceCheckPerformTransactionDto } from '../dto/balance/check-perform-transaction.dto';
import { BalanceCheckTransactionDto } from '../dto/balance/check-transaction.dto';
import { BalanceCreateTransactionDto } from '../dto/balance/create-transaction.dto';
import { BalanceGetStatementDto } from '../dto/balance/get-statement.dto';
import { BalancePerformTransactionDto } from '../dto/balance/perform-transaction.dto';

export type RequestBody =
  BalanceCancelTransactionDto
  BalanceCheckPerformTransactionDto
  BalanceCheckTransactionDto
  BalanceCreateTransactionDto
  BalanceGetStatementDto
  BalancePerformTransactionDto;
