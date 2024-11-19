import { TransactionMethods } from '../../constants/transaction-methods';

export class BalanceCancelTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
    reason: number;
  };
}
