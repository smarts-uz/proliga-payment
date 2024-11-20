import { TransactionMethods } from '../constants/transaction-methods';

export class CheckPerformTransactionDto {
  method: TransactionMethods;
  params: {
    amount: number;
    account: {
      user_id: string;
    };
  };
}

export class CheckPerformExpenseTransactionDto {
  method: TransactionMethods;
  params: {
    amount: number;
    account: {
      team_id: string;
      package_id: string;
    };
  };
}
