'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OAuth2Client } from 'google-auth-library';
import { sealData, unsealData } from 'iron-session';
import { jwtDecode } from 'jwt-decode';
import { Session } from '@/types/session';
import { JWT } from '@/types/jwt';

const oAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage',
);

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

  oAuthClient.setCredentials({
    refresh_token: session.refreshToken,
  });

  const {
    credentials: { refresh_token, id_token},
  } = await oAuthClient.refreshAccessToken();

  if (!refresh_token || !id_token ) return;

  session = {
    ...session,
    idToken: id_token,
    refreshToken: refresh_token,
  };
  return session;
};

export const removeSession = async () => {
  cookies().delete(process.env.SESSION_COOKIE_NAME);
  redirect('/login');
};

/**
 * @dev Exchange Google auth code for tokens
 * @param authCode Google auth code obtained while logging in
 * @returns redirect to home page
 */
export const loginWithGoogle = async (authCode: string) => {
  const { tokens } = await oAuthClient.getToken(authCode);
  const { id_token, refresh_token } = tokens;

  if (!id_token || !refresh_token) return;

  const { email, picture, name } = jwtDecode(id_token) as JWT;

  const session: Session = {
    picture,
    name,
    email,
    idToken: id_token,
    refreshToken: refresh_token,
  };

  await saveSession(session);

  return redirect('/');
};
