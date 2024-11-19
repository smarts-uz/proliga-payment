import { BalanceGetStatementDto } from '../../dto/balance/get-statement.dto';
import { PAYMENTSYSTEM } from 'src/enum/system.enum';
import { ErrorStatusCodes } from '../../constants/error-status-codes';

export async function BalanceGetStatement(
  this: any,
  getStatementDto: BalanceGetStatementDto,
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
        price: Number(transaction.price),// BigInt => Number
        account: { user_id: transaction.user_id },
        create_time: new Date(transaction.created_at).getTime(),
        perform_time: transaction.perform_time
          ? new Date(transaction.perform_time).getTime()
          : null,
        cancel_time: transaction.canceled_at
          ? new Date(transaction.canceled_at).getTime()
          : null,
        state: transaction.state,
        reason: transaction.reason || null,
      })),
    },
  };
}
