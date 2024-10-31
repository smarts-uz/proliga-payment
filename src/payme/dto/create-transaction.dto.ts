import { TransactionMethods } from '../constants/transaction-methods';

export class CreateTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
    time: number;
    price: number;
    account: {
      user_id: string;
    };
  };
}
