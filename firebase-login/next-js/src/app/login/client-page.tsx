'use client';

import Link from 'next/link';

type LoginClientPageProps = {
  twitterLoginUrl: string;
};

const LoginClientPage: React.FC<LoginClientPageProps> = ({
  twitterLoginUrl,
}) => {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center space-y-[32px] border-2 border-black">
      <h3 className="text-[24px] font-bold text-blue-950">Kaiju Wallet</h3>
      <Link
        className="min-w-[250px] flex flex-col justify-center items-center bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-[12px] w-[200px]"
        href={twitterLoginUrl}
      >
        Sign in with Twitter 🚀
      </Link>
    </div>
  );
};

export default LoginClientPage;
