import { CheckPerformTransactionDto } from '../dto/check-perform-transaction.dto';
import { ErrorStatusCodes } from '../constants/error-status-codes';

export async function checkPerformTransaction(
  this: any,
  checkPerformTransactionDto: CheckPerformTransactionDto,
) {
  const userId = checkPerformTransactionDto.params?.account?.user_id
    ? Number(checkPerformTransactionDto.params?.account?.user_id)
    : null;
  const price = checkPerformTransactionDto.params.amount;

  if (!userId) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAuthorization,
        message: {
          uz: 'Foydalanuvchi identifikatori kiritilmagan',
          en: 'User ID is missing',
          ru: 'Идентификатор пользователя отсутствует',
        },
      },
    };
  }

  const balance = await this.prismaService.subscribtion.findUnique({
    where: { id: userId },
  });

  console.log(balance, price);
  console.log(userId);
  // wrong sum balance: null
  // wrong sum price: 100
  // wrong sum selected sum: 100

  // transaction does not exist balance: null
  // transaction does not exist price: 102
  // transaction does not selected sum: 100

  if (!balance) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotAllowed,
        message: {
          uz: "Foydalanuvchi balansi yo'q",
          en: 'User balance does not exist',
          ru: 'Баланс пользователя не существует',
        },
      },
    };
  }

  if (price < 1 || price > 999999999 || price > balance?.price) {
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

  // const parsedUserId = Number(userId);

  // if (isNaN(parsedUserId)) {
  //   return {
  //     error: {
  //       code: ErrorStatusCodes.MissingUserId,
  //       message: {
  //         uz: 'Foydalanuvchi identifikatori noto‘g‘ri',
  //         en: 'Invalid user ID',
  //         ru: 'Неверный идентификатор пользователя',
  //       },
  //     },
  //   };
  // }

  return { result: { allow: true } };
}
