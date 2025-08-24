import { useState } from 'react'
import WalletConnect from './components/WalletConnect'
import MintNFT from './components/MintNFT'
import NFTGallery from './components/NFTGallery'
import ListNFTModal from './components/ListNFTModal'
import TransactionStatus from './components/TransactionStatus'
import { buyNFT, getTokenMetadata } from './utils/contractUtils'
import './App.css'

interface Transaction {
  id: string;
  type: 'mint' | 'list' | 'buy' | 'cancel';
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  details: string;
}

function App() {
  const [userAddress, setUserAddress] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'mint' | 'gallery'>('mint')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [listingModal, setListingModal] = useState<{
    isOpen: boolean;
    tokenId: number | null;
    tokenName: string;
    tokenImage: string;
  }>({
    isOpen: false,
    tokenId: null,
    tokenName: '',
    tokenImage: ''
  })

  const handleWalletConnect = (address: string) => {
    setUserAddress(address)
  }

  const addTransaction = (type: Transaction['type'], details: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      status: 'pending',
      timestamp: Date.now(),
      details
    }
    setTransactions(prev => [newTransaction, ...prev])
    return newTransaction.id
  }

  const updateTransaction = (id: string, status: 'success' | 'failed') => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === id ? { ...tx, status } : tx
      )
    )
  }

  const handleListNFT = async (tokenId: number) => {
    try {
      const metadata = await getTokenMetadata(tokenId)
      setListingModal({
        isOpen: true,
        tokenId,
        tokenName: metadata?.name || `NFT #${tokenId}`,
        tokenImage: metadata?.imageUri || '/placeholder.jpg'
      })
    } catch (error) {
      console.error('Error loading NFT metadata:', error)
    }
  }

  const handleBuyNFT = async (tokenId: number) => {
    const txId = addTransaction('buy', `Buying NFT #${tokenId}`)
    
    try {
      await buyNFT(
        tokenId,
        (transactionId) => {
          updateTransaction(txId, 'success')
          // Refresh gallery would happen here
        },
        (error) => {
          updateTransaction(txId, 'failed')
          console.error('Buy failed:', error)
        }
      )
    } catch (error) {
      updateTransaction(txId, 'failed')
      console.error('Unexpected buy error:', error)
    }
  }

  const handleListingSuccess = () => {
    // Refresh gallery or update state
    setListingModal({ isOpen: false, tokenId: null, tokenName: '', tokenImage: '' })
  }

  const clearTransactions = () => {
    setTransactions([])
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
          <>
            <nav className="app-nav">
              <button 
                onClick={() => setActiveTab('mint')}
                className={`nav-btn ${activeTab === 'mint' ? 'active' : ''}`}
              >
                Mint NFT
              </button>
              <button 
                onClick={() => setActiveTab('gallery')}
                className={`nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
              >
                Marketplace
              </button>
            </nav>

            <div className="app-content">
              {activeTab === 'mint' ? (
                <MintNFT userAddress={userAddress} />
              ) : (
                <NFTGallery 
                  userAddress={userAddress}
                  onListNFT={handleListNFT}
                  onBuyNFT={handleBuyNFT}
                />
              )}
            </div>

            <TransactionStatus 
              transactions={transactions}
              onClear={clearTransactions}
            />

            <ListNFTModal
              tokenId={listingModal.tokenId}
              tokenName={listingModal.tokenName}
              tokenImage={listingModal.tokenImage}
              isOpen={listingModal.isOpen}
              onClose={() => setListingModal({ isOpen: false, tokenId: null, tokenName: '', tokenImage: '' })}
              onSuccess={handleListingSuccess}
            />
          </>
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
