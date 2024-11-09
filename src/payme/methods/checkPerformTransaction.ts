import { CheckPerformTransactionDto } from '../dto/check-perform-transaction.dto';
import { ErrorStatusCodes } from '../constants/error-status-codes';

export async function checkPerformTransaction(
  this: any,
  checkPerformTransactionDto: CheckPerformTransactionDto,
) {
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
        code: ErrorStatusCodes.MissingUserId,
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
          uz: "Hisobda yetarli mablag' mavjud emas",
          en: 'Insufficient balance',
          ru: 'Недостаточно средств на счету',
        },
      },
    };
  }

  return { result: { allow: true } };
}
