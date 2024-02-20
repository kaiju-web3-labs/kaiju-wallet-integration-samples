import { removeSession } from '@/lib/actions/auth';

type TopBarProps = {
  address: string;
  balance: number;
};

const TopBar: React.FC<TopBarProps> = ({ address, balance }) => {
  return (
    <div className="w-full p-[24px] flex flex-col sm:flex-row justify-end gap-[8px] bg-blue-950">
      <h3 className="text-[24px] font-bold text-white mr-auto">
        Kaiju Wallet
      </h3>
      <h3 className="flex flex-col items-center justify-center bg-yellow-600 px-4 py-2 rounded-full text-white">
        {balance} XRP
      </h3>
      <h3 className="bg-blue-400 px-4 py-2 rounded-full text-white text-center hidden sm:inline-block">
        {address}
      </h3>
      <h3 className="bg-blue-400 px-4 py-2 rounded-full text-white text-center sm:hidden">
        {address.slice(0, 6)}...{address.slice(-6)}
      </h3>
      <button
        className="bg-red-400 hover:bg-red-500 px-4 py-2 rounded-[12px] text-white"
        onClick={() => removeSession()}
      >
        Logout
      </button>
    </div>
  );
};

export default TopBar;
