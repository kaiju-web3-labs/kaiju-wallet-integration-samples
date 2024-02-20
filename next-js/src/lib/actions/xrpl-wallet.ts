'use server';

import * as XRPL from 'xrpl';
import { ServerActionResult } from '@/types/server-action-result';
import { revalidatePath } from 'next/cache';
import { getSession } from './auth';
import { KaijuClient } from '../kaiju-saas-wallet-api';

interface GetBalanceResult extends ServerActionResult {
  balance: number;
}

export const getBalance = async (
  address: string,
): Promise<GetBalanceResult> => {
  try {
    const XRPLClient = new XRPL.Client(process.env.XRPL_SERVER_URL);
    await XRPLClient.connect();

    const balance = await XRPLClient.getXrpBalance(address);

    XRPLClient.disconnect();

    return { result: 'success', balance: balance ?? 0 };
  } catch (error) {
    return {
      result: 'error',
      error: 'Could not get balance',
      balance: 0,
    };
  }
};

export const topupXRP = async (
  receiverAddress: string,
  xrpAmount: number = 60,
) => {
  try {
    const XRPLClient = new XRPL.Client(process.env.XRPL_SERVER_URL);
    await XRPLClient.connect();

    const fundWalletResult = await XRPLClient.fundWallet();
    const fundWallet = fundWalletResult.wallet;

    const transaction = await XRPLClient.autofill({
      TransactionType: 'Payment',
      Account: fundWallet.address,
      Amount: XRPL.xrpToDrops(xrpAmount),
      Destination: receiverAddress,
    });

    const signedTransaction = fundWallet.sign(transaction);
    await XRPLClient.submitAndWait(signedTransaction.tx_blob);

    XRPLClient.disconnect();

    revalidatePath('/');
  } catch (error) {
    console.error(error);
  }
};

interface TransferXrpResult extends ServerActionResult {
  transactionHash?: string;
}

export const transferXRP = async (
  fromAddress: string,
  receiverAddress: string,
  xrpAmount: number,
): Promise<TransferXrpResult> => {
  try {
    // 1. Obtain new idToken. Before a new transaction you need to obtain new idToken
    const session = await getSession();

    if (!session)
      return {
        result: 'error',
        error: 'No user logged in',
      };

    const { idToken, email } = session;

    const XRPLClient = new XRPL.Client(process.env.XRPL_SERVER_URL);
    await XRPLClient.connect();

    // 2. Create a transaction
    const transaction = await XRPLClient.autofill({
      TransactionType: 'Payment',
      Account: fromAddress,
      Amount: XRPL.xrpToDrops(xrpAmount),
      Destination: receiverAddress,
    });

    // 3. Sign the transaction
    const signedTransaction = await KaijuClient.signTransaction(
      email,
      idToken,
      transaction,
    );

    if (!signedTransaction)
      return {
        result: 'error',
        error: 'Failed to sign transaction',
      };

    // 4. Submit the transaction
    const transactionResponse = await XRPLClient.submitAndWait(
      signedTransaction as string,
    );

    revalidatePath('/');

    return {
      result: 'success',
      transactionHash: transactionResponse.result.hash,
    };
  } catch (error) {
    console.error(error);
    return {
      result: 'error',
      error: 'Something happended. Please try again',
    };
  }
};
