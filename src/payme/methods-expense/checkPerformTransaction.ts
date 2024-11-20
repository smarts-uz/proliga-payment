import { CheckPerformExpenseTransactionDto } from '../dto/check-perform-transaction.dto';
import { ErrorStatusCodes } from '../constants/error-status-codes';

export async function checkPerformExpenseTransaction(
  this: any,
  checkPerformTransactionDto: CheckPerformExpenseTransactionDto,
) {
  const team_id = checkPerformTransactionDto.params?.account?.team_id
    ? Number(checkPerformTransactionDto.params?.account?.team_id)
    : null;
  const package_id = checkPerformTransactionDto.params?.account?.package_id
    ? Number(checkPerformTransactionDto.params?.account?.package_id)
    : null;
  const price = checkPerformTransactionDto.params.amount;
  const PAYME_MIN_AMOUNT = Number(process.env.PAYME_MIN_AMOUNT);
  const PAYME_MAX_AMOUNT = Number(process.env.PAYME_MAX_AMOUNT);

  if (!team_id) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAuthorization,
        message: {
          uz: 'Jamoa identifikatori kiritilmagan',
          en: 'Team ID is missing',
          ru: 'Идентификатор команды отсутствует',
        },
      },
    };
  }

  if (!package_id) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAuthorization,
        message: {
          uz: 'Paket identifikatori kiritilmagan',
          en: 'Package ID is missing',
          ru: 'Идентификатор пакета отсутствует',
        },
      },
    };
  }

  const user = await this.prismaService.team.findUnique({
    where: { id: team_id },
  });

  if (!user) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotAllowed,
        message: {
          uz: 'Foydalanuvchi topilmadi',
          en: 'User does not exist',
          ru: 'Пользователь не существует',
        },
      },
    };
  }

  const selectedPackage = await this.prismaService.pay_package.findUnique({
    where: { id: package_id },
  });

  if (!selectedPackage) {
    return {
      error: {
        code: ErrorStatusCodes.TransactionNotAllowed,
        message: {
          uz: 'Paket topilmadi',
          en: 'Package does not exist',
          ru: 'Пакет не существует',
        },
      },
    };
  }

  if (selectedPackage.price !== price) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAmount,
        message: {
          uz: 'Paket narxi noto`g`ri',
          en: 'Package price is not correct',
          ru: 'Сумма не соответствует пакету',
        },
      },
    };
  }

  if (price < Number(PAYME_MIN_AMOUNT) || price > Number(PAYME_MAX_AMOUNT)) {
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

  return { result: { allow: true } };
}
