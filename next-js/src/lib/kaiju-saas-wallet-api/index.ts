import { User } from '@/types/user';

interface GetWalletAPIResponse extends APIResponse {
  data: User;
}

interface SignTransactionAPIResponse extends APIResponse {
  data: any;
}

export class KaijuClient {
  static getHeaders = () => {
    const headers = new Headers();
    headers.append('authProviderId', process.env.KAIJU_GOOGLE_AUTH_PROVIDER_ID);
    headers.append('accessKey', process.env.KAIJU_ACCESS_KEY);
    headers.append('Content-Type', 'application/json');
    return headers;
  };

  /**
   *
   * @param email Email used to log into the wallet
   * @param idToken idToken obtained after logged in
   * @returns User account from the Kaiju SAAS Wallet API
   */
  static getWallet = async (
    email: string,
    idToken: string,
  ): Promise<User | null> => {
    const headers = KaijuClient.getHeaders();
    headers.append('token', idToken);

    const body = JSON.stringify({
      email,
      developer: false,
      blockchains: ['xrpl'],
    });

    const res = await fetch(
      `${process.env.KAIJU_SAAS_WALLET_BASE_URL}/getWallet`,
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

    const user = resJson.data as User;

    return user;
  };

  /**
   *
   * @param email  - Email used to log into the wallet
   * @param idToken - idToken obtained after logged in
   * @param transaction  - Transaction that need to be signed
   * @param XRPLClient - XRPL Client
   * @returns Signed transaction from Kaiju SAAS Wallet API
   */
  static signTransaction = async (
    email: string,
    idToken: string,
    transaction: any,
    XRPLClient: any,
  ) => {
    const autoFilledTransaction = await XRPLClient.autofill(transaction);

    const headers = KaijuClient.getHeaders();
    headers.append('token', idToken);

    const body = JSON.stringify({
      email,
      blockchain: 'xrpl',
      transactionType: 'transaction',
      payload: {
        transaction: autoFilledTransaction,
        transactionHash: '',
      },
    });

    const res = await fetch(
      `${process.env.KAIJU_SAAS_WALLET_BASE_URL}/signTransaction`,
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
