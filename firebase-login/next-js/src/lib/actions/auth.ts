'use server';

import { Session } from '@/types/session';
import { sealData, unsealData } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { KaijuClient } from '../kaiju-saas-wallet';
;

/**
 * @dev Save the session object in a cookie
 * @param session session object
 */
export const saveSession = async (session: Session) => {
  const sessionCookie = await sealData(session, {
    password: process.env.IRON_SESSION_PWD,
    ttl: 60 * 60 * 24 * 30, // 30 days
  });
 
   


  cookies().set(process.env.SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
};

/**
 * @dev This obtains new tokens using refresh tokens if tokens are expired
 * @returns User session
 */
export const getSession = async () => {
  const isSignedIn = cookies().has(process.env.SESSION_COOKIE_NAME);

  if (!isSignedIn) return null;
  const sessionCookie = cookies().get(process.env.SESSION_COOKIE_NAME);

  if (!sessionCookie) return null;

  const sessionData = await unsealData(sessionCookie.value, {
    password: process.env.IRON_SESSION_PWD,
    ttl: 60 * 60 * 24 * 30, // 30 days
  });

  let session = sessionData as Session;

  if (!session) return redirect('/login');

  return session;
};

/**
 * @dev Remove the session cookie
 */
export const removeSession = async () => {
  cookies().delete(process.env.SESSION_COOKIE_NAME);

  redirect('/login');
};

export const login = async (email: string, idToken: string) => {
  const user = await KaijuClient.getWallet(email, idToken);
  if (!user) redirect('/login');

  const session: Session = {
    email: email,
    userId: user.id,
    xrplAddress: user.blockchains.xrpl.walletAddress,
  };

  await saveSession(session);

  redirect('/');
};
