import { TransactionMethods } from '../../constants/transaction-methods';

export class ExpenseCreateTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
    time: number;
    amount: number;
    account: {
      package_id: string;
      team_id: string;
    };
  };
}
