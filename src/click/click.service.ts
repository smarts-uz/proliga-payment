import { Injectable } from '@nestjs/common';
import { ClickRequestDto } from './dto/click-request.dto';
import { TransactionActions } from './constants/transaction-action';
import { PrismaService } from 'src/prisma.service';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { ConfigService } from '@nestjs/config';
import { ClickError } from 'src/enum/Payment.enum';
import { prepare } from './services/prepare';
import { complete } from './services/complete';
import { prepareExpense } from './expense-services/prepare';
import { completeExpense } from './expense-services/complete';

@Injectable()
export class ClickService {
  private readonly secretKey: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = this.configService.get<string>('CLICK_SECRET');
  }

  async handleMerchantTransactions(clickReqBody: ClickRequestDto) {
    const actionType = clickReqBody.action;

    if (!clickReqBody?.amount) {
      return {
        error: ClickError.InvalidAmount,
        error_note: 'Invalid amount',
      };
    }
    if (!actionType) {
      return {
        error: ClickError.ActionNotFound,
        error_note: 'Invalid action',
      };
    }

    clickReqBody.amount = parseFloat(clickReqBody.amount.toString());

    switch (Number(actionType)) {
      case TransactionActions.Prepare:
        return this.prepare(clickReqBody);
      case TransactionActions.Complete:
        return this.complete(clickReqBody);
      default:
        return {
          error: ClickError.ActionNotFound,
          error_note: 'Invalid action',
        };
    }
  }

  async handleExpenseMerchantTransactions(clickReqBody: ClickRequestDto) {
    const actionType = clickReqBody.action;

    if (!clickReqBody?.amount) {
      return {
        error: ClickError.InvalidAmount,
        error_note: 'Invalid amount',
      };
    }
    if (!actionType) {
      return {
        error: ClickError.ActionNotFound,
        error_note: 'Invalid action',
      };
    }

    clickReqBody.amount = parseFloat(clickReqBody.amount.toString());

    switch (Number(actionType)) {
      case TransactionActions.Prepare:
        return this.prepareExpense(clickReqBody);
      case TransactionActions.Complete:
        return this.completeExpense(clickReqBody);
      default:
        return {
          error: ClickError.ActionNotFound,
          error_note: 'Invalid action',
        };
    }
  }

  // balance
  prepare(clickReqBody: ClickRequestDto) {
    return prepare.call(this, clickReqBody);
  }

  complete(clickReqBody: ClickRequestDto) {
    return complete.call(this, clickReqBody);
  }
  // expense
  prepareExpense(clickReqBody: ClickRequestDto) {
    return prepareExpense.call(this, clickReqBody);
  }

  completeExpense(clickReqBody: ClickRequestDto) {
    return completeExpense.call(this, clickReqBody);
  }
}
