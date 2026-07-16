import { sendPost } from 'src/core/network/requests';

export type TelegramUser = {
  id: number;
  username?: string;
  firstName: string;
  photoUrl?: string;
};

class TelegramService {
  async verifyLogin(authData: any, walletAddress: string): Promise<{ success: boolean; user: TelegramUser }> {
    const response = await sendPost<{ success: boolean; data: { user: TelegramUser } }>({
      endPoint: '/api/v1/telegram/verify',
      body: { authData, walletAddress },
    });
    return {
      success: Boolean(response.data?.success),
      user: response.data?.data?.user as TelegramUser,
    };
  }
}

export default new TelegramService();
