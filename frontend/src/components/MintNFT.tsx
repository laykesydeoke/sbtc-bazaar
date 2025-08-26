import React, { useState } from 'react';
import { mintNFT, NFTMetadata } from '../utils/contractUtils';

interface MintNFTProps {
  userAddress: string;
}

const MintNFT: React.FC<MintNFTProps> = ({ userAddress }) => {
  const [formData, setFormData] = useState<NFTMetadata & { collateral: string }>({
    name: '',
    description: '',
    imageUri: '',
    collateral: '1000000' // 0.01 sBTC default
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAddress) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.description || !formData.imageUri) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await mintNFT(
        parseInt(formData.collateral),
        {
          name: formData.name,
          description: formData.description,
          imageUri: formData.imageUri
        },
        (txId) => {
          setMessage(`NFT minting initiated! Transaction ID: ${txId}`);
          setFormData({
            name: '',
            description: '',
            imageUri: '',
            collateral: '1000000'
          });
          setLoading(false);
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

  return (
    <div className="mint-nft-container">
      <h2>Mint NFT with sBTC Collateral</h2>
      
      <form onSubmit={handleSubmit} className="mint-form">
        <div className="form-group">
          <label htmlFor="name">NFT Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            maxLength={64}
            placeholder="Enter NFT name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            maxLength={256}
            placeholder="Describe your NFT"
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUri">Image URI:</label>
          <input
            type="url"
            id="imageUri"
            name="imageUri"
            value={formData.imageUri}
            onChange={handleInputChange}
            maxLength={256}
            placeholder="https://example.com/image.png"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="collateral">sBTC Collateral (satoshis):</label>
          <input
            type="number"
            id="collateral"
            name="collateral"
            value={formData.collateral}
            onChange={handleInputChange}
            min="1000000"
            placeholder="Minimum 1,000,000 satoshis (0.01 sBTC)"
            required
          />
          <small>Minimum: 1,000,000 satoshis (0.01 sBTC)</small>
        </div>

        <button type="submit" disabled={loading || !userAddress} className="mint-btn">
          {loading ? 'Minting...' : 'Mint NFT'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {formData.imageUri && (
        <div className="preview">
          <h3>Preview:</h3>
          <img src={formData.imageUri} alt="NFT Preview" className="nft-preview" />
        </div>
      )}
    </div>
  );
};

export default MintNFT;