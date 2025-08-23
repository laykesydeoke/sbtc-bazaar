import { useState } from 'react'
import WalletConnect from './components/WalletConnect'
import MintNFT from './components/MintNFT'
import './App.css'

function App() {
  const [userAddress, setUserAddress] = useState<string>('')

  const handleWalletConnect = (address: string) => {
    setUserAddress(address)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>sBTC Bazaar</h1>
        <p>Bitcoin-backed NFT Marketplace on Stacks</p>
        <WalletConnect onWalletConnect={handleWalletConnect} />
      </header>

      <main className="app-main">
        {userAddress ? (
          <MintNFT userAddress={userAddress} />
        ) : (
          <div className="welcome">
            <h2>Welcome to sBTC Bazaar</h2>
            <p>Connect your Stacks wallet to start minting NFTs backed by sBTC collateral.</p>
            <div className="features">
              <div className="feature">
                <h3>🔗 sBTC Collateral</h3>
                <p>Mint NFTs backed by Bitcoin through sBTC</p>
              </div>
              <div className="feature">
                <h3>🏪 Marketplace</h3>
                <p>List and trade your NFTs with other users</p>
              </div>
              <div className="feature">
                <h3>⚡ Low Fees</h3>
                <p>Trade with minimal gas fees on Stacks L2</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
