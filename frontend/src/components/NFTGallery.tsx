import React, { useState, useEffect } from 'react';
import { getLastTokenId, getTokenMetadata, getTokenListing, NFTMetadata, NFTListing } from '../utils/contractUtils';

interface NFT {
  id: number;
  metadata: NFTMetadata | null;
  listing: NFTListing | null;
}

interface NFTGalleryProps {
  userAddress: string;
  onListNFT: (tokenId: number) => void;
  onBuyNFT: (tokenId: number) => void;
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ userAddress, onListNFT, onBuyNFT }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'owned' | 'listed'>('all');

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      const lastTokenId = await getLastTokenId();
      const nftPromises: Promise<NFT>[] = [];

      // Load all minted NFTs
      for (let i = 1; i <= lastTokenId; i++) {
        nftPromises.push(loadNFTData(i));
      }

      const loadedNFTs = await Promise.all(nftPromises);
      setNfts(loadedNFTs.filter(nft => nft.metadata !== null));
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNFTData = async (tokenId: number): Promise<NFT> => {
    const [metadata, listing] = await Promise.all([
      getTokenMetadata(tokenId),
      getTokenListing(tokenId)
    ]);

    return {
      id: tokenId,
      metadata,
      listing
    };
  };

  const filteredNFTs = nfts.filter(nft => {
    switch (filter) {
      case 'owned':
        // For now, we can't easily check ownership without additional contract calls
        // This would require implementing nft-get-owner functionality
        return !nft.listing; // Assume unlisted NFTs might be owned by user
      case 'listed':
        return nft.listing !== null;
      default:
        return true;
    }
  });

  const formatPrice = (price: number) => {
    return `${(price / 100000000).toFixed(8)} sBTC`;
  };

  const handleRefresh = () => {
    loadNFTs();
  };

  if (loading) {
    return (
      <div className="nft-gallery">
        <div className="gallery-header">
          <h2>NFT Gallery</h2>
          <button onClick={handleRefresh} className="refresh-btn">Refresh</button>
        </div>
        <div className="loading">Loading NFTs...</div>
      </div>
    );
  }

  return (
    <div className="nft-gallery">
      <div className="gallery-header">
        <h2>NFT Gallery</h2>
        <div className="gallery-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as 'all' | 'owned' | 'listed')}
            className="filter-select"
          >
            <option value="all">All NFTs</option>
            <option value="listed">Listed for Sale</option>
            <option value="owned">Unlisted</option>
          </select>
          <button onClick={handleRefresh} className="refresh-btn">Refresh</button>
        </div>
      </div>

      {filteredNFTs.length === 0 ? (
        <div className="empty-gallery">
          <p>No NFTs found. {filter === 'all' ? 'Mint your first NFT to get started!' : `No ${filter} NFTs available.`}</p>
        </div>
      ) : (
        <div className="nft-grid">
          {filteredNFTs.map((nft) => (
            <div key={nft.id} className="nft-card">
              <div className="nft-image-container">
                <img 
                  src={nft.metadata?.imageUri || '/placeholder.jpg'} 
                  alt={nft.metadata?.name || `NFT #${nft.id}`}
                  className="nft-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg';
                  }}
                />
                <div className="nft-id">#{nft.id}</div>
              </div>
              
              <div className="nft-details">
                <h3 className="nft-name">{nft.metadata?.name || `NFT #${nft.id}`}</h3>
                <p className="nft-description">
                  {nft.metadata?.description || 'No description available'}
                </p>
                
                {nft.listing ? (
                  <div className="nft-listing-info">
                    <div className="nft-price">
                      <span className="price-label">Listed for:</span>
                      <span className="price-value">{formatPrice(nft.listing.price)}</span>
                    </div>
                    <div className="nft-seller">
                      <span className="seller-label">Seller:</span>
                      <span className="seller-address">
                        {nft.listing.seller.slice(0, 8)}...{nft.listing.seller.slice(-8)}
                      </span>
                    </div>
                    
                    {nft.listing.seller !== userAddress && (
                      <button 
                        onClick={() => onBuyNFT(nft.id)}
                        className="buy-btn"
                      >
                        Buy Now
                      </button>
                    )}
                    
                    {nft.listing.seller === userAddress && (
                      <div className="owner-badge">Your Listing</div>
                    )}
                  </div>
                ) : (
                  <div className="nft-actions">
                    <button 
                      onClick={() => onListNFT(nft.id)}
                      className="list-btn"
                    >
                      List for Sale
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTGallery;