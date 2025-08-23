import React, { useState, useEffect } from 'react';
import { showConnect, AppConfig, UserSession, openContractCall } from '@stacks/connect';
import { StacksDevnet } from '@stacks/network';
import { 
  uintCV, 
  stringAsciiCV, 
  standardPrincipalCV,
  PostConditionMode 
} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

interface WalletConnectProps {
  onWalletConnect: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnect }) => {
  const [userAddress, setUserAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        const address = userData.profile.stxAddress.testnet;
        setUserAddress(address);
        setIsConnected(true);
        onWalletConnect(address);
      });
    } else if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const address = userData.profile.stxAddress.testnet;
      setUserAddress(address);
      setIsConnected(true);
      onWalletConnect(address);
    }
  }, [onWalletConnect]);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'sBTC Bazaar',
        icon: window.location.origin + '/vite.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserAddress('');
    setIsConnected(false);
    window.location.reload();
  };

  if (isConnected) {
    return (
      <div className="wallet-connected">
        <p>Connected: {userAddress.slice(0, 8)}...{userAddress.slice(-8)}</p>
        <button onClick={disconnectWallet} className="disconnect-btn">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={connectWallet} className="connect-btn">
      Connect Wallet
    </button>
  );
};

export default WalletConnect;