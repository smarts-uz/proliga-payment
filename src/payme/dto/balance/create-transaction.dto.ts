import { TransactionMethods } from '../../constants/transaction-methods';

export class BalanceCreateTransactionDto {
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
