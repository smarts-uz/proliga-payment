import { TransactionMethods } from '../constants/transaction-methods';

export class CreateTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
    time: number;
    amount: number;
    account: {
      user_id: string;
    };
  };
}

export class CreateExpenseTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
    time: number;
    amount: number;
    account: {
      team_id: string;
      package_id: string;
    };
  };
}
