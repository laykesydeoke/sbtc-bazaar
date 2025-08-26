import React, { useState } from 'react';
import { listNFT } from '../utils/contractUtils';

interface ListNFTModalProps {
  tokenId: number | null;
  tokenName: string;
  tokenImage: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ListNFTModal: React.FC<ListNFTModalProps> = ({
  tokenId,
  tokenName,
  tokenImage,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenId || !price) {
      setMessage('Please enter a valid price');
      return;
    }

    const priceInSatoshis = Math.floor(parseFloat(price) * 100000000);
    
    if (priceInSatoshis <= 0) {
      setMessage('Price must be greater than 0');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await listNFT(
        tokenId,
        priceInSatoshis,
        (txId) => {
          setMessage(`NFT listed successfully! Transaction ID: ${txId}`);
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000);
        },
        (error) => {
          setMessage(`Error: ${error}`);
          setLoading(false);
        }
      );
    } catch (error) {
      setMessage(`Unexpected error: ${error}`);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPrice('');
    setMessage('');
    setLoading(false);
    onClose();
  };

  const formatPricePreview = (priceStr: string) => {
    const num = parseFloat(priceStr);
    return isNaN(num) ? '0' : num.toFixed(8);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>List NFT for Sale</h2>
          <button onClick={handleClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          <div className="nft-preview">
            <img src={tokenImage} alt={tokenName} className="preview-image" />
            <h3>{tokenName}</h3>
            <p>Token ID: #{tokenId}</p>
          </div>

          <form onSubmit={handleSubmit} className="listing-form">
            <div className="form-group">
              <label htmlFor="price">Sale Price (sBTC):</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.00000001"
                min="0.00000001"
                placeholder="0.01"
                required
              />
              <div className="price-info">
                <small>Preview: {formatPricePreview(price)} sBTC</small>
                <small>Marketplace fee: 2.5%</small>
                <small>
                  You'll receive: ~{(parseFloat(price || '0') * 0.975).toFixed(8)} sBTC
                </small>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={handleClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={loading || !price} className="confirm-btn">
                {loading ? 'Listing...' : 'List NFT'}
              </button>
            </div>
          </form>

          {message && (
            <div className={`modal-message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListNFTModal;