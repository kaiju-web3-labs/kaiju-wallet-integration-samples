import { removeSession } from '@/lib/actions/auth';
import { FaCopy } from 'react-icons/fa'; 


type TopBarProps = {
  address: string;
  spendableBalance: number;
  totalReserve: number;
  userName: string; 
  userEmail: string;
  userImage: string;
};


const TopBar: React.FC<TopBarProps> = ({ address, spendableBalance, totalReserve, userName, userEmail, userImage }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="w-full p-[24px] flex flex-col sm:flex-row justify-end gap-[8px] bg-blue-950">
      <div className="flex mr-auto gap-[8px]">
        <img src={userImage} alt="Profile" className="w-[40px] h-[40px] rounded-full " />
        <div className="flex flex-col mr-auto ">
          <h3 className="text-[15px] font-bold text-white ">{userName}</h3>
          <h3 className="text-[13px]  text-white">{userEmail}</h3>
        </div>
      </div>
      <h3 className="flex items-center justify-center bg-yellow-600 px-4 rounded-full text-white gap-2 h-10">
        <div>{spendableBalance}</div> 
        <div>({totalReserve} reserved) XRP</div>
      </h3>

      <h3 className="bg-blue-400 px-4 py-2 rounded-full text-white text-right hidden sm:inline-block items-center justify-end h-10" >
      <FaCopy className="mr-2 sm:inline-block cursor-pointer" onClick={copyToClipboard} />
        {address}
      </h3>
      <h3 className="bg-blue-400 px-4 py-2 rounded-full text-white text-center sm:hidden h-10">
        {address.slice(0, 6)}...{address.slice(-6)}
        <FaCopy className="cursor-pointer" onClick={copyToClipboard} style={{ marginTop: '-20px' }}  />
      </h3>
      <button
        className="bg-red-400 hover:bg-red-500 px-4 py-2 rounded-[12px] text-white h-10"
        onClick={() => removeSession()}
      >
        Logout
      </button>
    </div>
  );
};


export default TopBar;
