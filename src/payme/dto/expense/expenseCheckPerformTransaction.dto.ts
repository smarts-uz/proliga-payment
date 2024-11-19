import { TransactionMethods } from '../../constants/transaction-methods';

export class ExpenseCheckPerformTransactionDto {
  method: TransactionMethods;
  params: {
    amount: number;
    account: {
      package_id: string;
      team_id: string;
    };
  };
}
