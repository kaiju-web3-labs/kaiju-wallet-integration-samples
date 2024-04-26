import { getAuthorizeUrl } from '@/lib/actions/discord';
import LoginClientPage from './client-page';

const LoginPage: React.FC = async () => {
  const discordLoginUrl = getAuthorizeUrl();

  return <LoginClientPage discordLoginUrl={discordLoginUrl} />;
};

export default LoginPage;
