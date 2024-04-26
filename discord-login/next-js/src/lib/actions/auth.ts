'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sealData, unsealData } from 'iron-session';
import { Session } from '@/types/session';
import { getTokens as getDiscordTokens, getUserInfo } from './discord';

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

export const removeSession = async () => {
  cookies().delete(process.env.SESSION_COOKIE_NAME);
  redirect('/login');
};

export const loginWithDiscord = async (authCode: string) => {
  const tokens = await getDiscordTokens(authCode);
  if (!tokens) return;

  const { access_token, refresh_token } = tokens;

  const user = await getUserInfo(access_token);
  if (!user) return;

  const { email, global_name, avatar } = user;

  const avatarUrl = avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${avatar}.png` : '';


  const session: Session = {
    global_name,
    avatar: avatarUrl,
    email,
    accessToken: access_token,
    idToken: access_token,
    refreshToken: refresh_token,
  };

  await saveSession(session);

  return session;
};
