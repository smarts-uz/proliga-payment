import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PaymeService } from '../../payme/payme.service';
import { BalanceRequestBody } from "../types/IncomingRequestBodyBalance";

@Controller('balance')
export class BalanceController {
  constructor(private readonly paymeService: PaymeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleBalanceTransaction(@Body() reqBody: BalanceRequestBody) {
    const { method } = reqBody;

    switch (method) {
      case 'BalanceCheckPerformTransaction':
        return await this.paymeService.BalanceCheckPerformTransaction(reqBody);

      case 'BalanceCreateTransaction':
        return await this.paymeService.BalanceCreateTransaction(reqBody);

      case 'BalancePerformTransaction':
        return await this.paymeService.BalancePerformTransaction(reqBody);

      case 'BalanceCancelTransaction':
        return await this.paymeService.BalanceCancelTransaction(reqBody);

      case 'BalanceGetStatement':
        return await this.paymeService.BalanceGetStatement(reqBody);

      case 'BalanceCheckTransaction':
        return await this.paymeService.BalanceCheckTransaction(reqBody);

      default:
        return { error: 'Invalid method' };
    }
  }
}
