'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import PulseLoader from 'react-spinners/PulseLoader';
import { topupXRP, transferXRP } from '@/lib/actions/xrpl-wallet';
import { User } from '@/types/user';
import TopBar from '@/components/top-bar';
import { Session } from '@/types/session';
import { getSession } from '@/lib/actions/auth';

type HomeClientPageProps = {
  user: User;
  spendableBalance: number;
  totalReserve: number;
};

const HomeClientPage: React.FC<HomeClientPageProps> = ({ user, spendableBalance,totalReserve }) => {
  const [transactionResult, setTransactionResult] = useState<string>();
  const [transactionHash, setTransactionHash] = useState<string>();
  const [isToppingUp, startToppingUp] = useTransition();
  const [isSending, startSending] = useTransition();
  const [discordDetails, setDiscordDetails] = useState<any>();

  function setUserData(session: Session | null | undefined) {
    if (session) {
      const { global_name, email, avatar } = session;
      setDiscordDetails({
        name: global_name,
        email: email,
        picture: avatar,
      });
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      setUserData(session);
    };
    fetchData();
  }, []);

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
    setTransactionResult(result.transactionResult);
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <TopBar
        address={user.blockchains.xrpl.walletAddress}
        spendableBalance={spendableBalance}
        totalReserve={totalReserve}
        userName={discordDetails?.name}
        userEmail={discordDetails?.email}
        userImage={discordDetails?.picture}
      />

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
            <div
              className={`text-md font-medium pb-5 ${
                transactionResult === 'tesSUCCESS'
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              {transactionResult === 'tesSUCCESS'
                ? 'Transaction Succeeded'
                : 'Transaction Failed'}
            </div>
            <h3
              className={`text-[14px] ${
                transactionResult === 'tesSUCCESS'
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >Transaction Hash:</h3>
            <Link
              href={`https://testnet.xrpl.org/transactions/${transactionHash}`}
              target="_blank"
              className={`text-[14px] underline hidden sm:inline-block ${
                transactionResult === 'tesSUCCESS'
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
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
      <h2 className="text-3xl font-bold text-center mt-auto mb-auto">
        Kaiju Wallet
      </h2>
    </main>
  );
};

export default HomeClientPage;
