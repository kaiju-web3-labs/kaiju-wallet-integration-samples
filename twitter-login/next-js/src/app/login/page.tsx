'use client';

import { useState } from 'react';
import { getAuth, signInWithPopup, TwitterAuthProvider } from 'firebase/auth';
import PulseLoader from 'react-spinners/PulseLoader';
import { login } from '@/lib/actions/auth';
import firebaseApp from '@/config/firebase';

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const onLoginClick = async () => {
    setIsLoggingIn(true);
    const auth = getAuth(firebaseApp);
    const provider = new TwitterAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    try {
      const userCredential = await signInWithPopup(auth, provider);

      const idToken = await userCredential.user.getIdToken();

      const { email } = userCredential.user;

      if (!email || !idToken) return;

      console.log('email:', email);
      console.log('JWT_Token:', idToken);

      await login(email, idToken);
      setIsLoggingIn(false);
    } catch (error) {
      console.error('Error signing in with Twitter:', error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center space-y-[32px] border-2 border-black">
      <h3 className="text-[24px] font-bold text-blue-950">Kaiju Wallet</h3>
      <button
        className="min-w-[250px] flex flex-col justify-center items-center bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-[12px] w-[200px]"
        onClick={onLoginClick}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <PulseLoader size={10} color="white" />
        ) : (
          'Sign in with Twitter 🚀'
        )}
      </button>
    </div>
  );
}
