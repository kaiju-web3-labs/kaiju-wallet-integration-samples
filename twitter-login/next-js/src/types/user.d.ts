type UserBlockchain = {
  walletAddress: string;
  walletAddressOwner: string;
};

type UserSocialMedia = {
  title: string;
  value: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  userProfileImage: string;
  blockchains: {
    evm: UserBlockchain;
    solana: UserBlockchain;
    xrpl: UserBlockchain;
  };
  username: string;
  ens: string;
  bio: string;
  website: UserSocialMedia;
  instagram: UserSocialMedia;
  twitter: UserSocialMedia;
  discord: UserSocialMedia;
  youtube: UserSocialMedia;
  linkedin: UserSocialMedia;
  userLevel: string;
  walletVersion: string;
  publicNFTProfile: boolean;
  analytics: boolean;
  currency: string;
  developerId: string;
  isDeveloper: boolean;
  userStatus: string;
};
