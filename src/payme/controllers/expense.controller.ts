import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PaymeService } from '../../payme/payme.service';
import { ExpenseRequestBody } from "../types/IncomingRequestBodyExpense";

@Controller('expense')
export class ExpenseController {
  constructor(private readonly paymeService: PaymeService) {}
  sactions;
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleExpenseTransaction(@Body() reqBody: ExpenseRequestBody) {
    const { method } = reqBody;

    switch (method) {
      case 'ExpenseCheckPerformTransaction':
        return await this.paymeService.ExpenseCheckPerformTransaction(reqBody);

      case 'ExpenseCreateTransaction':
        return await this.paymeService.ExpenseCreateTransaction(reqBody);

      case 'ExpensePerformTransaction':
        return await this.paymeService.ExpensePerformTransaction(reqBody);

      case 'ExpenseCancelTransaction':
        return await this.paymeService.ExpenseCancelTransaction(reqBody);

      case 'ExpenseGetStatement':
        return await this.paymeService.ExpenseGetStatement(reqBody);

      case 'ExpenseCheckTransaction':
        return await this.paymeService.ExpenseCheckTransaction(reqBody);

      default:
        return { error: 'Invalid method' };
    }
  }
}
