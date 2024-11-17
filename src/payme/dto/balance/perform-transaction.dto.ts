import { TransactionMethods } from '../../constants/transaction-methods';

export class BalancePerformTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
  };
}
