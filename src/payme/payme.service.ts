import { Injectable } from '@nestjs/common';
import { TransactionMethods } from './constants/transaction-methods';
import { CheckPerformTransactionDto } from './dto/check-perform-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RequestBody } from './types/incoming-request-body';
import { GetStatementDto } from './dto/get-statement.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { PerformTransactionDto } from './dto/perform-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ErrorStatusCodes } from './constants/error-status-codes';
import { PaymeError } from './constants/payme-error';
import { DateTime } from 'luxon';
import { TransactionState } from './constants/transaction-state';

export const CancelingReasons = {
    CanceledDueToTimeout: 'Canceled due to timeout',
};

@Injectable()
export class PaymeService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleTransactionMethods(reqBody: RequestBody) {
    const method = reqBody.method;

    switch (method) {
      case TransactionMethods.CheckPerformTransaction:
        return await this.checkPerformTransaction(reqBody as CheckPerformTransactionDto);
      case TransactionMethods.CreateTransaction:
        return await this.createTransaction(reqBody as CreateTransactionDto);
      case TransactionMethods.PerformTransaction:
        return await this.performTransaction(reqBody as PerformTransactionDto);
      case TransactionMethods.CancelTransaction:
        return await this.cancelTransaction(reqBody as CancelTransactionDto);
      case TransactionMethods.GetStatement:
        return await this.getStatement(reqBody as GetStatementDto);
      default:
        return { error: 'Invalid transaction method' };
    }
  }

  async checkPerformTransaction(checkPerformTransactionDto: CheckPerformTransactionDto) {
    const userId = Number(checkPerformTransactionDto.params?.account?.user_id);
    const amount = checkPerformTransactionDto.params.amount;

    const balance = await this.prismaService.pay_balance.findUnique({
      where: { id: userId },
    });

    if (!balance || typeof balance.price !== 'number' || balance.price < amount) {
      return {
        error: {
          code: ErrorStatusCodes.TransactionNotAllowed,
          message: {
            uz: 'Hisobda yetarli mablag\' mavjud emas',
            en: 'Insufficient balance',
            ru: 'Недостаточно средств на счету',
          },
        },
      };
    }

    return { result: { allow: true } };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const userId = Number(createTransactionDto.params?.account?.user_id);
    const amount = createTransactionDto.params.amount;

    const balance = await this.prismaService.pay_balance.findUnique({
      where: { id: userId },
    });

    if (!balance || typeof balance.price !== 'number' || balance.price < amount) {
      return { error: PaymeError.InsufficientFunds };
    }

    const newBalance = await this.prismaService.pay_balance.update({
      where: { id: userId },
      data: { price: { decrement: amount } },
    });

    return {
      result: {
        balance: newBalance.price,
        transactionId: createTransactionDto.params.id,
      },
    };
  }

  async performTransaction(performTransactionDto: PerformTransactionDto) {
    const transaction = await this.prismaService.pay_balance.findUnique({
      where: { id: Number(performTransactionDto.params.id) },
    });

    if (!transaction) {
      return { error: PaymeError.TransactionNotFound, id: performTransactionDto.params.id };
    }

    if (transaction.state !== TransactionState.Pending) {
      if (transaction.state !== TransactionState.Paid) {
        return { error: PaymeError.CantDoOperation, id: performTransactionDto.params.id };
      }

      return {
        result: {
          state: transaction.state,
          transaction: transaction.id,
          perform_time: transaction.performTime ? new Date(transaction.performTime).getTime() : null,
        },
      };
    }

    const isExpired = this.checkTransactionExpiration(transaction.createdAt);

    if (isExpired) {
      await this.prismaService.pay_balance.update({
        where: { id: transaction.id },
        data: {
          status: 'CANCELED',
          cancelTime: new Date(),
          state: TransactionState.PendingCanceled,
          reason: Number(CancelingReasons.CanceledDueToTimeout),
        },
      });

      return {
        error: {
          state: TransactionState.PendingCanceled,
          reason: CancelingReasons.CanceledDueToTimeout,
          ...PaymeError.CantDoOperation,
        },
        id: performTransactionDto.params.id,
      };
    }

    const performTime = new Date();

    const updatedTransaction = await this.prismaService.pay_balance.update({
      where: { id: transaction.id },
      data: {
        status: 'PAID', 
        state: TransactionState.Paid,
        performTime,
      },
    });

    return {
      result: {
        transaction: updatedTransaction.id,
        perform_time: performTime.getTime(),
        state: TransactionState.Paid,
      },
    };
  }

  async cancelTransaction(cancelTransactionDto: CancelTransactionDto) {
    const transId = cancelTransactionDto.params.id;

    const transaction = await this.prismaService.pay_balance.findUnique({
      where: { id: Number(transId) },
    });

    if (!transaction) {
      return { id: transId, error: PaymeError.TransactionNotFound };
    }

    if (transaction.state === TransactionState.Pending) {
      const canceledTransaction = await this.prismaService.pay_balance.update({
        where: { id: transaction.id },
        data: {
          status: TransactionState.PaidCanceled,
          state: TransactionState.PendingCanceled,
          cancelTime: new Date(),
          reason: cancelTransactionDto.params.reason,
        },
      });

      return {
        result: {
          cancel_time: canceledTransaction.cancelTime?.getTime(),
          transaction: canceledTransaction.id,
          state: TransactionState.PendingCanceled,
        },
      };
    }

    return {
      result: {
        state: transaction.state,
        transaction: transaction.id,
        cancel_time: transaction.cancelTime?.getTime(),
      },
    };
  }

  async getStatement(getStatementDto: GetStatementDto) {
    const transactions = await this.prismaService.pay_balance.findMany({
      where: {
        createdAt: {
          gte: new Date(getStatementDto.params.from),
          lte: new Date(getStatementDto.params.to),
        },
        system: 'Payme',
      },
    });

    return {
      result: {
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          time: new Date(transaction.createdAt).getTime(),
          amount: transaction.price,
          account: { user_id: transaction.user_id },
          create_time: new Date(transaction.createdAt).getTime(),
          perform_time: transaction.performTime ? new Date(transaction.performTime).getTime() : null,
          cancel_time: transaction.cancelTime ? new Date(transaction.cancelTime).getTime() : null,
          state: transaction.state,
          reason: transaction.reason || null,
        })),
      },
    };
  }

  private checkTransactionExpiration(createdAt: Date): boolean {
    const transactionCreatedAt = new Date(createdAt);
    const timeoutDuration = 720; // 12 hours
    const timeoutThreshold = DateTime.now()
      .minus({ minutes: timeoutDuration })
      .toJSDate();

    return transactionCreatedAt < timeoutThreshold;
  }
}
