import { redirect } from 'next/navigation';
import { getSession } from '@/lib/actions/auth';
import HomeClientPage from './client-page';
import { getBalanceWithReserve } from '@/lib/actions/xrpl-wallet';

export default async function HomePage() {
  const session = await getSession();

  if (!session) redirect('/login');

  const { xrplAddress } = session;

  const result = await getBalanceWithReserve(xrplAddress);

  return (
    <HomeClientPage walletAddress={xrplAddress} spendableBalance={result.spendableBalance || 0} totalReserve={result.totalReserve ||0} />
  );
}
