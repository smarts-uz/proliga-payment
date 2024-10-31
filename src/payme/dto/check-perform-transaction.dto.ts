import { TransactionMethods } from '../constants/transaction-methods';

export class CheckPerformTransactionDto {
  method: TransactionMethods;
  params: {
    price: number;
    account: {
      user_id: string;
    };
  };
}
