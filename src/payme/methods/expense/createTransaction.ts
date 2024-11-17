import { CreateTransactionDto } from '../../dto/expense/create-transaction.dto';
import { TransactionState } from '../../constants/transaction-state';
import { CheckPerformTransactionDto } from '../../dto/expense/check-perform-transaction.dto';
import { TransactionMethods } from '../../constants/transaction-methods';
import { ErrorStatusCodes } from '../../constants/error-status-codes';
import * as console from "node:console";


export async function createTransaction(
  this: any,
  createTransactionDto: CreateTransactionDto,
) {
  const package_id = Number(createTransactionDto.params?.account?.package_id);
  const amount = createTransactionDto.params.amount;
  const team_id = Number(createTransactionDto.params?.account?.team_id);

  if (!package_id) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAuthorization,
        message: {
          uz: 'Noto‘g‘ri avtorizatsiya',
          en: 'Invalid authorization',
          ru: 'Неверная авторизация',
        },
      },
    };
  }

  const pkg = await this.prismaService.pay_package.findUnique({
    where: {id: package_id},
  });

  if (!pkg) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotAllowed,
        message: {
          ru: 'Transaction topilomadi',
          uz: 'Transaction topilomadi',
          en: 'Transaction topilomadi',
        },
      },
    };
  }


  const pay_package = await this.prismaService.pay_package.findUnique({
    where: {id: package_id},
  });

  const existingTransaction = await this.prismaService.pay_expense.findFirst({
    where: {pay_package_id: package_id},
  });

  console.log(typeof existingTransaction)

  if ( existingTransaction?.team_id) {
    const existingItem = existingTransaction.team_id;

    if (existingItem.pay_package_type === pay_package.type) {
      return {
        error: {
          code: ErrorStatusCodes.TransactionNotAllowed,
          message: {
            uz: "siz bu packeddan avval olgansiz",
          },
        },
      };
    }
    if(existingItem.priority > pay_package.priority) {
      return {
        error: {
          code: ErrorStatusCodes.TransactionNotAllowed,
          message: {
            uz: "siz bu packeddan avval olgansiz",
          },
        }
      }
    }

    const transId = await this.prismaService.pay_expense.findUnique({
      where: {transaction_id: createTransactionDto.params.id},
    });

    if (transId) {
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
        amount: amount,
        account: {
          package_id: package_id,
          team_id: team_id,
        },
      },
    };

    const checkResult = await this.checkPerformTransaction(checkTransaction);

    if (checkResult.error) {
      return {
        error: checkResult.error,
        id: transId?.transaction_id,
      };
    }

    const newTransaction = await this.prismaService.pay_expense.create({
      data: {
        pay_package_id: package_id,
        price: amount,
        transaction_id: createTransactionDto.params.id,
        state: 1, // Assuming state 1 means pending or active state
        created_at: new Date(),
        updated_at: new Date(),
        team_id: team_id, // Assuming the team_id is dynamic
      },
    });

    return {
      result: {
        balance: newTransaction.price,
        transaction: newTransaction.transaction_id,
        state: TransactionState.Pending,
        create_time: new Date(newTransaction.created_at).getTime(),
      },
    };
  }

  console.log("nnnnn")
  if (!pay_package) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAmount,
        message: {
          ru: 'Неверная сумма',
          uz: 'Incorrect amount',
          en: 'Incorrect amount',
        },
      },
    };
  }

  if (pay_package.price > amount) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAmount,
        message: {
          ru: 'Неверная сумма',
          uz: 'Incorrect amount',
          en: 'Incorrect amount',
        },
      },
    };
  }

  if (amount < 1 || amount > 999999999) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAmount,
        message: {
          ru: 'Неверная сумма',
          uz: 'Incorrect amount',
          en: 'Incorrect amount',
        },
      },
    };
  }
  const transId = await this.prismaService.pay_expense.findUnique({
    where: {transaction_id: createTransactionDto.params.id},
  });

  if (transId) {
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
      amount: amount,
      account: {
        package_id: package_id,
        team_id: team_id,
      },
    },
  };

  const checkResult = await this.checkPerformTransaction(checkTransaction);

  if (checkResult.error) {
    return {
      error: checkResult.error,
      id: transId?.transaction_id,
    };
  }

  const newTransaction = await this.prismaService.pay_expense.create({
    data: {
      pay_package_id: package_id,
      price: amount,
      transaction_id: createTransactionDto.params.id,
      state: 1,
      created_at: new Date(),
      updated_at: new Date(),
      team_id: 895,
    },
  });

  return {
    result: {
      balance: newTransaction.price,
      transaction: newTransaction.transaction_id,
      state: TransactionState.Pending,
      create_time: new Date(newTransaction.created_at).getTime(),
    },
  };
}

