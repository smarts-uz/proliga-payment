import { TransactionMethods } from '../../constants/transaction-methods';

export class ExpenseCheckTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
  };
}
