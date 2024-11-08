import { Injectable } from '@nestjs/common';
import { TransactionMethods } from './constants/transaction-methods';
import { CheckPerformTransactionDto } from './dto/check-perform-transaction.dto';
import { PrismaService } from 'src/prisma.service';
import { RequestBody } from './types/incoming-request-body';
import { GetStatementDto } from './dto/get-statement.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { PerformTransactionDto } from './dto/perform-transaction.dto';
import { CheckTransactionDto } from './dto/check-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ErrorStatusCodes } from './constants/error-status-codes';
import { PaymeError } from './constants/payme-error';
import { DateTime } from 'luxon';
import { TransactionState } from './constants/transaction-state';
import { PAYMENTSYSTEM } from 'src/enum/system.enum';

export const CancelingReasons = {
  CanceledDueToTimeout: 'Canceled due to timeout',
};

@Injectable()
export class PaymeService {
  constructor(private readonly prismaService: PrismaService) { }

  async handleTransactionMethods(reqBody: RequestBody) {
    const method = reqBody.method;

    console.log("a", method);

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
      case TransactionMethods.CheckTransaction:
        return await this.checkTransaction(reqBody as CheckTransactionDto);
      default:
        return { error: 'Invalid transaction method' };
    }
  }

  async checkPerformTransaction(checkPerformTransactionDto: CheckPerformTransactionDto) {
    const userId = checkPerformTransactionDto.params?.account?.user_id;
    if (!userId) {
      return {
        error: {
          code: ErrorStatusCodes.MissingUserId,
          message: {
            uz: 'Foydalanuvchi identifikatori kiritilmagan',
            en: 'User ID is missing',
            ru: 'Идентификатор пользователя отсутствует',
          },
        },
      };
    }

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
      return {
        error: {
          code: ErrorStatusCodes.InvalidUserId,
          message: {
            uz: 'Foydalanuvchi identifikatori noto‘g‘ri',
            en: 'Invalid user ID',
            ru: 'Неверный идентификатор пользователя',
          },
        },
      };
    }

    const price = checkPerformTransactionDto.params.amount / 100;


    const balance = await this.prismaService.subscribtion.findUnique({
      where: { id: parsedUserId },
    });


    if (!balance || typeof balance.price !== 'number' || balance.price < price) {
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

    const subid = await this.prismaService.usersub.findUnique({
      where: { id: userId },
    });

    const balance = await this.prismaService.subscribtion.findFirst({
      where: { id: subid.subs_id }
    });
    // console.log("subdan|", balance)

    if (!balance || typeof balance.price !== 'number' || balance.price < amount / 100) {
      return { error: PaymeError.InsufficientFunds };
    }


    const transId = await this.prismaService.pay_balance.findFirst({
      where: { transaction_id: createTransactionDto.params.id }
    })
    // console.log(transId)

    if (transId !== null && transId !== undefined) {
      console.log('ifdaman');
      
      if (transId.status !== 'pending') {
        return {
          error: PaymeError.CantDoOperation,
          id: transId.transaction_id,
        };
      }
      if (this.checkTransactionExpiration(transId.created_at)) {
        await this.prismaService.pay_balance.update({
          where: { id: transId.id },
          data: {
            status: 'canceled',
            canceled_at: new Date(),
            state: TransactionState.PendingCanceled,
          }
        })


        return {
          error: {
            ...PaymeError.CantDoOperation,
            state: TransactionState.PendingCanceled,
            reason: CancelingReasons.CanceledDueToTimeout,
          },
          id: transId.transaction_id,
        };
      }

      return {
        result: {
          balance: transId.price,
          transaction: transId.transaction_id,
          state: TransactionState.Pending,
          create_time: new Date(transId.created_at).getTime(),
        },
      };
    }

    const checkTransaction: CheckPerformTransactionDto = {
      method: TransactionMethods.CheckPerformTransaction,
      params: {
        amount: balance.price * 100,
        account: {
          user_id: userId.toString(),
        },
      },
    };

    const checkResult = await this.checkPerformTransaction(
      checkTransaction,
    );
    // console.log(checkResult);



    if (checkResult.error) {
      return {
        error: checkResult.error,
        id: transId.transaction_id,
      };
    }

    const newTransaction = await this.prismaService.pay_balance.create({
      data: {
        user_id: userId,
        price: balance.price -amount,
        transaction_id: createTransactionDto.params.id,
        state: 1, 
        created_at: new Date(),
        updated_at: new Date()
      },
    });
    console.log("n", newTransaction);


    return {
      result: {
        balance: newTransaction.price,
        transaction: createTransactionDto.params.id,
        state: TransactionState.Pending,
        create_time: new Date(newTransaction.created_at).getTime(),
      },
    };
  }


  async checkTransaction(checkTransactionDto: CheckTransactionDto) {
    const transactionId = checkTransactionDto.params.id;

    const transaction = await this.prismaService.pay_balance.findFirst({
      where: { transaction_id: transactionId },
    });

    if (!transaction || !transaction.transaction_id) {
      return {
        error: {
          code: 1008,
          message: {
            uz: "Tranzaksiya topilmadi",
            en: "Transaction not found",
            ru: "Транзакция не найдена",
          },
        },
      };
    }

    if (transaction.status === 'paid') {
      
      return {
        error: {
          code: 1009,  
          message: {
            uz: "Tranzaksiya to'lov qilingan",
            en: "Transaction has already been paid",
            ru: "Транзакция уже оплачена",
          },
        },
      };
    }

    return {
      result: {
        create_time : transaction.created_at,
        perform_time: transaction.perform_time,
        cancel_time : transaction.canceled_at ? transaction.canceled_at.getTime() : 0,
        transaction : transaction.transaction_id,
        state: transaction.state !== null && transaction.state !== undefined ? transaction.state : 2,
        reason: transaction.reason
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
          perform_time: transaction.updated_at ? new Date(transaction.updated_at).getTime() : null,
        },
      };
    }

    const isExpired = this.checkTransactionExpiration(transaction.created_at);

    if (isExpired) {
      await this.prismaService.pay_balance.update({
        where: { id: transaction.id },
        data: {
          status: 'CANCELED',
          canceled_at: new Date(),
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
        updated_at: performTime,
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
          canceled_at: new Date(),
          reason: cancelTransactionDto.params.reason,
        },
      });

      return {
        result: {
          cancel_time: canceledTransaction.canceled_at?.getTime(),
          transaction: canceledTransaction.id,
          state: TransactionState.PendingCanceled,
        },
      };
    }

    return {
      result: {
        state: transaction.state,
        transaction: transaction.id,
        cancel_time: transaction.canceled_at?.getTime(),
      },
    };
  }

  async getStatement(getStatementDto: GetStatementDto) {
    const transactions = await this.prismaService.pay_balance.findMany({
      where: {
        created_at: {
          gte: new Date(getStatementDto.params.from),
          lte: new Date(getStatementDto.params.to),
        },
        system: PAYMENTSYSTEM.PAYME,
      },
    });

    return {
      result: {
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          time: new Date(transaction.created_at).getTime(),
          price: transaction.price,
          account: { user_id: transaction.user_id },
          create_time: new Date(transaction.created_at).getTime(),
          perform_time: transaction.updated_at ? new Date(transaction.updated_at).getTime() : null,
          cancel_time: transaction.canceled_at ? new Date(transaction.canceled_at).getTime() : null,
          state: transaction.state,
          reason: transaction.reason || null,
        })),
      },
    };
  }


  private checkTransactionExpiration(created_at: Date) {
    const transactioncreated_at = new Date(created_at);
    const timeoutDuration = 1;
    const timeoutThreshold = DateTime.now()
      .minus({
        minutes: timeoutDuration,
      })
      .toJSDate();

    return transactioncreated_at < timeoutThreshold;
  }
  // private checkTransactionExpiration(createdAt: Date): boolean {
  //   const transactionCreatedAt = new Date(createdAt);
  //   const timeoutDuration = 720; // 12 hours
  //   const timeoutThreshold = DateTime.now()
  //     .minus({ minutes: timeoutDuration })
  //     .toJSDate();

  //   return transactionCreatedAt < timeoutThreshold;
  // }
}
