import { TransactionMethods } from '../../constants/transaction-methods';


export class ExpenseGetStatementDto {
  method: TransactionMethods;
  params: {
    from: number;
    to: number;
  };
}
