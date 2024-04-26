'use server';

export const getAuthorizeUrl = (): string => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    scope: 'email identify',
  });
  return `${process.env.DISCORD_AUTHORIZE_URL}?${params}`;
};

type DicordTokenResponse = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export const getTokens = async (
  authCode: string,
): Promise<DicordTokenResponse | null> => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');
  headers.append('Accept-Encoding', 'application/x-www-form-urlencoded');

  const res = await fetch(process.env.DISCORD_TOKEN_ENDPOINT_URL, {
    method: 'POST',
    headers,
    body: params,
  });

  const resJson = await res.json();

  if (resJson.code === 0) return null;

  return resJson as DicordTokenResponse;
};

type DiscordUserResponse = {
  email: string;
  global_name:string;
  avatar:string;
  id:string;
};

export const getRefreshTokens = async (
  refreshToken: string,
): Promise<DicordTokenResponse | null> => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');
  headers.append('Accept-Encoding', 'application/x-www-form-urlencoded');

  const res = await fetch(process.env.DISCORD_TOKEN_ENDPOINT_URL, {
    method: 'POST',
    headers,
    body: params,
  });

  const resJson = await res.json();

  if (resJson.code === 0) return null;

  return resJson as DicordTokenResponse;
};

export const getUserInfo = async (
  accessToken: string,
): Promise<DiscordUserResponse | null> => {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(process.env.DISCORD_USER_INFO_ENDPOINT_URL, {
    method: 'GET',
    headers,
  });

  const resJson = await res.json();

  if (resJson.code === 0) return null;

  return resJson as DiscordUserResponse;
};
