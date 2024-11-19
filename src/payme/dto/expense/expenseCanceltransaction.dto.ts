import { TransactionMethods } from '../../constants/transaction-methods';

export class ExpenseCancelTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
    reason: number;
  };
}
