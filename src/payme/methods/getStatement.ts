import { GetStatementDto } from '../dto/get-statement.dto';
import { PAYMENTSYSTEM } from 'src/enum/system.enum';
import { ErrorStatusCodes } from '../constants/error-status-codes';

export async function getStatement(
  this: any,
  getStatementDto: GetStatementDto,
) {
  const transactions = await this.prismaService.pay_balance.findMany({
    where: {
      created_at: {
        gte: new Date(getStatementDto.params.from),
        lte: new Date(getStatementDto.params.to),
      },
      system: PAYMENTSYSTEM.PAYME,
    },
  });

  if (!transactions || transactions?.length <= 0) {
    return {
      error: {
        code: ErrorStatusCodes.InvalidAuthorization,
        message: {
          uz: 'Tranzaksiya topilmadi',
          en: 'Transaction not found',
          ru: 'Транзакция не найдена',
        },
      },
    };
  }

  return {
    result: {
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        time: new Date(transaction.created_at).getTime(),
        price: Number(transaction.price), // BigInt => Number
        account: { user_id: transaction.user_id },
        create_time: new Date(transaction.created_at).getTime(),
        perform_time: transaction.perform_time
          ? new Date(transaction.perform_time).getTime()
          : 0,
        cancel_time: transaction.canceled_at
          ? new Date(transaction.canceled_at).getTime()
          : 0,
        state: transaction.state,
        reason: transaction.reason || null,
      })),
    },
  };
}
