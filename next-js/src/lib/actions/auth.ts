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

  cookies().set('kaiju-auth', sessionCookie, {
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
  const isSignedIn = cookies().has('kaiju-auth');

  if (!isSignedIn) return null;
  const sessionCookie = cookies().get('kaiju-auth');

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
    credentials: { refresh_token, id_token, access_token },
  } = await oAuthClient.refreshAccessToken();

  if (!refresh_token || !id_token || !access_token) return;

  session = {
    ...session,
    idToken: id_token,
    accessToken: access_token,
    refreshToken: refresh_token,
  };

  return session;
};

export const removeSession = async () => {
  cookies().delete('kaiju-auth');
  redirect('/login');
};

/**
 * @dev Exchange Google auth code for tokens
 * @param authCode Google auth code obtained while logging in
 * @returns redirect to home page
 */
export const loginWithGoogle = async (authCode: string) => {
  const { tokens } = await oAuthClient.getToken(authCode);
  const { id_token, access_token, refresh_token } = tokens;

  if (!id_token || !access_token || !refresh_token) return;

  const { email } = jwtDecode(id_token) as JWT;

  const session: Session = {
    email,
    accessToken: access_token,
    idToken: id_token,
    refreshToken: refresh_token,
  };

  await saveSession(session);

  return redirect('/');
};
