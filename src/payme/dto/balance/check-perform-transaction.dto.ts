import { TransactionMethods } from '../../constants/transaction-methods';

export class BalanceCheckPerformTransactionDto {
  method: TransactionMethods;
  params: {
    amount: number;
    account: {
      user_id: string;
    };
  };
}
