'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import PulseLoader from 'react-spinners/PulseLoader';
import { topupXRP, transferXRP } from '@/lib/actions/xrpl-wallet';
import { User } from '@/types/user';
import TopBar from '@/components/top-bar';

type HomeClientPageProps = {
  user: User;
  balance: number;
};

const HomeClientPage: React.FC<HomeClientPageProps> = ({ user, balance }) => {
  const [transactionHash, setTransactionHash] = useState<string>();
  const [isToppingUp, startToppingUp] = useTransition();
  const [isSending, startSending] = useTransition();

  const topupWallet = () => {
    topupXRP(user.blockchains.xrpl.walletAddress);
  };

  const sendTransaction = async (event: FormData) => {
    setTransactionHash(undefined);
    const receiverAddress = event.get('receiverAddress')?.toString();
    const amount = event.get('amount')?.toString();

    if (!receiverAddress || !amount) return;

    const result = await transferXRP(
      user.blockchains.xrpl.walletAddress,
      receiverAddress,
      Number(amount),
    );

    if (result.error) alert(result.error);

    setTransactionHash(result.transactionHash);
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <TopBar address={user.blockchains.xrpl.walletAddress} balance={balance} />

      <button
        className="w-fit flex flex-row justify-center items-center min-w-[150px] bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-[12px] text-white mt-[20px]"
        type="button"
        disabled={isToppingUp}
        onClick={() => startToppingUp(topupWallet)}
      >
        {isToppingUp ? (
          <PulseLoader size={10} color="white" />
        ) : (
          'Topup 60 XRP (Testnet only)'
        )}
      </button>
      <form
        action={(event) => startSending(() => sendTransaction(event))}
        className="w-5/6 sm:w-1/2 flex flex-col space-y-[8px] rounded-[12px] p-4 mt-[20px] border-2 border-black"
      >
        <p>Transfer XRP to</p>
        <input
          name="receiverAddress"
          className="w-full h-[40px] rounded-[12px] border-2 border-black/40 p-2"
        />
        <p>Amount</p>
        <input
          name="amount"
          className="w-full h-[40px] rounded-[12px] border-2 border-black/40 p-2"
        />
        <button
          className="w-fit self-end min-w-[150px] bg-blue-400 hover:bg-blue-500 px-4 py-2 mt-[16px] rounded-[12px] text-white"
          type="submit"
          disabled={isSending}
        >
          {isSending ? <PulseLoader size={10} color="white" /> : 'Transfer'}
        </button>

        {transactionHash && (
          <>
            <h3 className="text-green-500 text-[14px]">Transaction Hash:</h3>
            <Link
              href={`https://testnet.xrpl.org/transactions/${transactionHash}`}
              target="_blank"
              className="text-green-500 text-[14px] underline hidden sm:inline-block"
            >
              {transactionHash}
            </Link>
            <Link
              href={`https://testnet.xrpl.org/transactions/${transactionHash}`}
              target="_blank"
              className="text-green-500 text-[14px] underline sm:hidden"
            >
              {transactionHash.slice(0, 15)}...{transactionHash.slice(-15)}
            </Link>
          </>
        )}
      </form>
    </main>
  );
};

export default HomeClientPage;
