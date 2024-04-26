'use server';

import * as XRPL from 'xrpl';
import { ServerActionResult } from '@/types/server-action-result';
import { revalidatePath } from 'next/cache';
import { getSession } from './auth';
import { KaijuClient } from '../kaiju-saas-wallet';


let spendableBalance: number;
let totalReserve: number;

interface GetBalanceWithReservesResult extends ServerActionResult {
  balanceWithReserve?: number;
  spendableBalance?: number;
  totalReserve?: number;
}

export const getBalanceWithReserve = async (
  walletAddress: string,
): Promise<GetBalanceWithReservesResult> => {
  try {
    const XRPLClient = new XRPL.Client(process.env.XRPL_SERVER_URL);
    await XRPLClient.connect();

    const serverInfoResponse = await XRPLClient.request({
      id: 1,
      command: 'server_info',
      counters: false,
    });

    if (!serverInfoResponse.result.info.validated_ledger)
      return {
        result: 'error',
        error: 'Failed to get server info',
      };

    const reserveBaseXrp =
      serverInfoResponse.result.info.validated_ledger.reserve_base_xrp;
    const reserveIncXrp =
      serverInfoResponse.result.info.validated_ledger.reserve_inc_xrp;

    const accountInfo = await XRPLClient.request({
      id: 2,
      command: 'account_info',
      account: walletAddress,
      ledger_index: 'current',
      queue: true,
    });

    const ownercount = accountInfo.result.account_data.OwnerCount;

    totalReserve = ownercount * reserveIncXrp + reserveBaseXrp;

    const balanceWithReserve = await XRPLClient.getXrpBalance(walletAddress);

    await XRPLClient.disconnect();

    spendableBalance = parseFloat((balanceWithReserve - totalReserve).toFixed(2));

    return {
      result: 'success',
      balanceWithReserve,
      spendableBalance,
      totalReserve,
    };
  } catch (err: any) {
    console.error(err);
    return {
      result: 'error',
      error: err.toString(),
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
  transactionResult?: string;
}

export const transferXRP = async (
  fromAddress: string,
  receiverAddress: string,
  xrpAmount: number,
): Promise<TransferXrpResult> => {
  try {
    if (xrpAmount > spendableBalance) {
      return {
        result: 'error',
        error: `Cannot transfer this amount. Maximum transfer amount is ${spendableBalance} XRP`,
      };
    }

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

    let transactionResult;
    if (transactionResponse?.result?.meta && typeof transactionResponse.result.meta !== 'string' && 'TransactionResult' in transactionResponse.result.meta) {
      transactionResult = transactionResponse.result.meta.TransactionResult;
    }
  
    revalidatePath('/');

    return {
      result: 'success',
      transactionHash: transactionResponse.result.hash,
      transactionResult: transactionResult,
    };
  } catch (error) {
    console.error(error);
    return {
      result: 'error',
      error: 'Something happended. Please try again',
    };
  }
};
