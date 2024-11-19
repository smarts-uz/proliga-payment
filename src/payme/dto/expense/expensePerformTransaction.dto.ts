import { TransactionMethods } from '../../constants/transaction-methods';

export class ExpensePerformTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
  };
}
