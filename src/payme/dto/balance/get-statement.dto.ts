import { TransactionMethods } from '../../constants/transaction-methods';


export class BalanceGetStatementDto {
  method: TransactionMethods;
  params: {
    from: number;
    to: number;
  };
}
