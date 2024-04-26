import React from 'react';
import { redirect } from 'next/navigation';
import { getBalanceWithReserve } from '@/lib/actions/xrpl-wallet';
import { KaijuClient } from '@/lib/kaiju-saas-wallet';
import { getSession } from '@/lib/actions/auth';
import HomeClientPage from './client-page';

export default async function HomePage() {
  const session = await getSession();
  if (!session) return redirect('/login');

  const { email, idToken } = session;

  // An idToken that is not expired should be used
  const user = await KaijuClient.getWallet(email, idToken);
  if (!user) return redirect('/login');

  const result = await getBalanceWithReserve(user.blockchains.xrpl.walletAddress) ;

  return <HomeClientPage user={user} spendableBalance={result.spendableBalance || 0} totalReserve={result.totalReserve ||0} />;
}
