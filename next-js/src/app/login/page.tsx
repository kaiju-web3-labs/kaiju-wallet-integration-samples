'use client';

import { loginWithGoogle } from '@/lib/actions/auth';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import PulseLoader from 'react-spinners/PulseLoader';

const LoginPage: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      loginWithGoogle(codeResponse.code);
    },
    onError: (error) => {
      console.log('Login Failed:', error);
      setIsLoggingIn(false);
    },
    flow: 'auth-code',
    onNonOAuthError: (error) => {
      console.log('Login Failed:', error);
      setIsLoggingIn(false);
    },
  });

  const onClickLoginWithGoogle = () => {
    setIsLoggingIn(true);
    login();
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center space-y-[32px] border-2 border-black">
      <h3 className="text-[24px] font-bold text-blue-950">Kaiju Wallet</h3>
      <button
        className="min-w-[250px] flex flex-col justify-center items-center bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-[12px] w-[200px]"
        onClick={onClickLoginWithGoogle}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <PulseLoader size={10} color="white" />
        ) : (
          'Sign in with Google 🚀'
        )}
      </button>
    </div>
  );
};

export default LoginPage;
