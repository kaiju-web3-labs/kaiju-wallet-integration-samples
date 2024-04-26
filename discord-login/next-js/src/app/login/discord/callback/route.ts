import { redirect } from 'next/navigation';
import { loginWithDiscord } from '@/lib/actions/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) redirect('/login');

  const session = await loginWithDiscord(code);

  return redirect('/');
}
