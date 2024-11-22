import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymeService } from './payme.service';
import { RequestBody } from './types/incoming-request-body';
import { PaymeBasicAuthGuard } from 'src/auth/guards/payme.guard';

@Controller('payme')
export class PaymeController {
  constructor(private readonly paymeService: PaymeService) {}

  @Post('pay') 
  @UseGuards(PaymeBasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async handleTransactionMethods(@Body() reqBody: RequestBody) {
    return await this.paymeService.handleTransactionMethods(reqBody);
  }
  @Post('expense')
  @UseGuards(PaymeBasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async handleExpenseTransactionMethods(@Body() reqBody: RequestBody) {
    return await this.paymeService.handleExpenseTransactionMethods(reqBody);
  }
}
