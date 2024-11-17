import { TransactionMethods } from '../../constants/transaction-methods';

export class BalanceCheckTransactionDto {
  method: TransactionMethods;
  params: {
    id: string;
  };
}
