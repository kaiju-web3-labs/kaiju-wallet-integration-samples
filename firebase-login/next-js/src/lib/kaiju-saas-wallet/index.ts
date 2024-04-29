import { KaijuUser } from '@/types/kaiju-user';

interface GetWalletAPIResponse extends APIResponse {
  data: KaijuUser;
}

interface SignTransactionAPIResponse extends APIResponse {
  data: any;
}

export class KaijuClient {
  static getHeaders = () => {
    const headers = new Headers();
    headers.append(
      'authProviderId',
      process.env.KAIJU_FIREBASE_AUTH_PROVIDER_ID,
    );
    headers.append('accessKey', process.env.KAIJU_PROJECT_ACCESS_KEY);
    headers.append('Content-Type', 'application/json');
    return headers;
  };

  /**
   *
   * @param email Email used to log into the wallet
   * @param token token obtained after logged in
   * @returns User account from the Kaiju SAAS Wallet API
   */
  static getWallet = async (
    email: string,
    token: string,
  ): Promise<KaijuUser | null> => {
    const headers = KaijuClient.getHeaders();
    headers.append('token', token);

    const body = JSON.stringify({
      email,
      developer: false,
      blockchains: ['xrpl'],
    });

    const res = await fetch(
      `${process.env.KAIJU_SAAS_WALLET_BASE_URL}/kms/getWallet`,
      {
        method: 'POST',
        headers,
        body,
        cache: 'no-cache',
      },
    );

    const resJson = (await res.json()) as GetWalletAPIResponse;

    if (resJson.code === -1) {
      return null;
    }

    const user = resJson.data as KaijuUser;
    return user;
  };

  /**
   *
   * @param email  - Email used to log into the wallet
   * @param token - token obtained after logged in
   * @param transaction  - Transaction that need to be signed
   * @returns Signed transaction from Kaiju SAAS Wallet API
   */
  static signTransaction = async (
    email: string,
    token: string,
    transaction: any,
  ) => {
    const headers = KaijuClient.getHeaders();
    headers.append('token', token);

    const body = JSON.stringify({
      email,
      blockchain: 'xrpl',
      transactionType: 'transaction',
      payload: {
        transaction: transaction,
        transactionHash: '',
      },
    });

    const res = await fetch(
      `${process.env.KAIJU_SAAS_WALLET_BASE_URL}/kms/signTransaction`,
      {
        method: 'POST',
        headers,
        body,
      },
    );

    const resJson = (await res.json()) as SignTransactionAPIResponse;

    if (resJson.code === -1) {
      return null;
    }

    const signedTransaction = resJson.data.signedPayload.transaction;

    return signedTransaction;
  };
}
