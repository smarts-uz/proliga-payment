import { Injectable } from '@nestjs/common';
import { TransactionMethods } from './constants/transaction-methods';
import {
  CheckPerformTransactionDto,
  CheckPerformExpenseTransactionDto
} from './dto/check-perform-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RequestBody } from './types/incoming-request-body';
import { GetStatementDto } from './dto/get-statement.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { PerformTransactionDto } from './dto/perform-transaction.dto';
import { CheckTransactionDto } from './dto/check-transaction.dto';
import {
  CreateExpenseTransactionDto,
  CreateTransactionDto,
} from './dto/create-transaction.dto';
import { DateTime } from 'luxon';

import { checkPerformTransaction } from './methods/checkPerformTransaction';
import { createTransaction } from './methods/createTransaction';
import { checkTransaction } from './methods/checkTransaction';
import { performTransaction } from './methods/performTransaction';
import { cancelTransaction } from './methods/cancelTransaction';
import { getStatement } from './methods/getStatement';

import { checkExpenseTransaction } from './methods-expense/checkTransaction';
import { createExpenseTransaction } from './methods-expense/createTransaction';
import { cancelExpenseTransaction } from './methods-expense/cancelTransaction';
import { getExpenseStatement } from './methods-expense/getStatement';
import { checkPerformExpenseTransaction } from './methods-expense/checkPerformTransaction';
import { performExpenseTransaction } from './methods-expense/performTransaction';

export const CancelingReasons = {
  CanceledDueToTimeout: 'Canceled due to timeout',
};

@Injectable()
export class PaymeService {
  constructor(private readonly prismaService: PrismaService) { }

  // Balance
  async handleTransactionMethods(reqBody: RequestBody) {
    const method = reqBody.method;

    switch (method) {
      case TransactionMethods.CheckPerformTransaction:
        return await this.checkPerformTransaction(
          reqBody as CheckPerformTransactionDto,
        );
      case TransactionMethods.CreateTransaction:
        return await this.createTransaction(reqBody as CreateTransactionDto);
      case TransactionMethods.PerformTransaction:
        return await this.performTransaction(reqBody as PerformTransactionDto);
      case TransactionMethods.CancelTransaction:
        return await this.cancelTransaction(reqBody as CancelTransactionDto);
      case TransactionMethods.GetStatement:
        return await this.getStatement(reqBody as GetStatementDto);
      case TransactionMethods.CheckTransaction:
        return await this.checkTransaction(reqBody as CheckTransactionDto);
      default:
        return { error: 'Invalid transaction method' };
    }
  }

  async checkPerformTransaction(
    checkPerformTransactionDto: CheckPerformTransactionDto,
  ) {
    return checkPerformTransaction.call(this, checkPerformTransactionDto);
  }

  async createTransaction(CreateTransactionDto: CreateTransactionDto) {
    return createTransaction.call(this, CreateTransactionDto);
  }

  async checkTransaction(checkTransactionDto: CheckTransactionDto) {
    return checkTransaction.call(this, checkTransactionDto);
  }

  async performTransaction(performTransactionDto: PerformTransactionDto) {
    return performTransaction.call(this, performTransactionDto);
  }

  async cancelTransaction(cancelTransactionDto: CancelTransactionDto) {
    return cancelTransaction.call(this, cancelTransactionDto);
  }

  async getStatement(getStatementDto: GetStatementDto) {
    return getStatement.call(this, getStatementDto);
  }

  // Expense
  async handleExpenseTransactionMethods(reqBody: RequestBody) {
    const method = reqBody.method;

    switch (method) {
      case TransactionMethods.CheckPerformTransaction:
        return await this.checkPerformExpenseTransaction(
          reqBody as unknown as CheckPerformExpenseTransactionDto,
        );
      case TransactionMethods.CreateTransaction:
        return await this.createExpenseTransaction(
          reqBody as CreateExpenseTransactionDto,
        );
      case TransactionMethods.PerformTransaction:
        return await this.performExpenseTransaction(
          reqBody as PerformTransactionDto,
        );
      case TransactionMethods.CancelTransaction:
        return await this.cancelExpenseTransaction(
          reqBody as CancelTransactionDto,
        );
      case TransactionMethods.GetStatement:
        return await this.getExpenseStatement(reqBody as GetStatementDto);
      case TransactionMethods.CheckTransaction:
        return await this.checkExpenseTransaction(
          reqBody as CheckTransactionDto,
        );
      default:
        return { error: 'Invalid transaction method' };
    }
  }

  async checkPerformExpenseTransaction(
    checkPerformTransactionDto: CheckPerformExpenseTransactionDto,
  ) {
    return checkPerformExpenseTransaction.call(this, checkPerformTransactionDto);
  }

  async createExpenseTransaction(
    CreateTransactionDto: CreateExpenseTransactionDto,
  ) {
    return createExpenseTransaction.call(this, CreateTransactionDto);
  }

  async checkExpenseTransaction(checkTransactionDto: CheckTransactionDto) {
    return checkExpenseTransaction.call(this, checkTransactionDto);
  }

  async performExpenseTransaction(
    performTransactionDto: PerformTransactionDto,
  ) {
    return performExpenseTransaction.call(this, performTransactionDto);
  }

  async cancelExpenseTransaction(cancelTransactionDto: CancelTransactionDto) {
    return cancelExpenseTransaction.call(this, cancelTransactionDto);
  }

  async getExpenseStatement(getStatementDto: GetStatementDto) {
    return getExpenseStatement.call(this, getStatementDto);
  }

  private checkTransactionExpiration(created_at: Date) {
    const transactionCreatedAt = new Date(created_at);
    const timeoutDuration = 300;
    const timeoutThreshold = DateTime.now()
      .minus({
        minutes: timeoutDuration,
      })
      .toJSDate();

    return transactionCreatedAt < timeoutThreshold;
  }
}
