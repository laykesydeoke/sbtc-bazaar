import { 
  openContractCall, 
  UserSession, 
  AppConfig 
} from '@stacks/connect';
import { 
  uintCV, 
  stringAsciiCV, 
  PostConditionMode,
  callReadOnlyFunction,
  cvToJSON
} from '@stacks/transactions';
import { StacksDevnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksDevnet();

// Contract details
const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Default devnet address
const contractName = 'nft-marketplace';

export interface NFTMetadata {
  name: string;
  description: string;
  imageUri: string;
}

export interface NFTListing {
  price: number;
  seller: string;
}

// Mint NFT function
export const mintNFT = async (
  collateralAmount: number,
  metadata: NFTMetadata,
  onSuccess: (txId: string) => void,
  onError: (error: string) => void
) => {
  if (!userSession.isUserSignedIn()) {
    onError('Please connect your wallet first');
    return;
  }

  try {
    await openContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'mint-nft',
      functionArgs: [
        uintCV(collateralAmount),
        stringAsciiCV(metadata.name),
        stringAsciiCV(metadata.description),
        stringAsciiCV(metadata.imageUri),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        onSuccess(data.txId);
      },
      onCancel: () => {
        onError('Transaction cancelled');
      },
    });
  } catch (error) {
    onError(`Minting failed: ${error}`);
  }
};

// List NFT function
export const listNFT = async (
  tokenId: number,
  price: number,
  onSuccess: (txId: string) => void,
  onError: (error: string) => void
) => {
  if (!userSession.isUserSignedIn()) {
    onError('Please connect your wallet first');
    return;
  }

  try {
    await openContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'list-nft',
      functionArgs: [
        uintCV(tokenId),
        uintCV(price),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        onSuccess(data.txId);
      },
      onCancel: () => {
        onError('Transaction cancelled');
      },
    });
  } catch (error) {
    onError(`Listing failed: ${error}`);
  }
};

// Buy NFT function
export const buyNFT = async (
  tokenId: number,
  onSuccess: (txId: string) => void,
  onError: (error: string) => void
) => {
  if (!userSession.isUserSignedIn()) {
    onError('Please connect your wallet first');
    return;
  }

  try {
    await openContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'buy-nft',
      functionArgs: [uintCV(tokenId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        onSuccess(data.txId);
      },
      onCancel: () => {
        onError('Transaction cancelled');
      },
    });
  } catch (error) {
    onError(`Purchase failed: ${error}`);
  }
};

// Read-only functions
export const getLastTokenId = async (): Promise<number> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-last-token-id',
      functionArgs: [],
      network,
      senderAddress: contractAddress,
    });
    
    const jsonResult = cvToJSON(result);
    return parseInt(jsonResult.value);
  } catch (error) {
    console.error('Error getting last token ID:', error);
    return 0;
  }
};

export const getTokenMetadata = async (tokenId: number): Promise<NFTMetadata | null> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-token-metadata',
      functionArgs: [uintCV(tokenId)],
      network,
      senderAddress: contractAddress,
    });
    
    const jsonResult = cvToJSON(result);
    if (jsonResult.type === 'optional' && jsonResult.value) {
      return {
        name: jsonResult.value.name.value,
        description: jsonResult.value.description.value,
        imageUri: jsonResult.value['image-uri'].value,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting token metadata:', error);
    return null;
  }
};

export const getTokenListing = async (tokenId: number): Promise<NFTListing | null> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-token-listing',
      functionArgs: [uintCV(tokenId)],
      network,
      senderAddress: contractAddress,
    });
    
    const jsonResult = cvToJSON(result);
    if (jsonResult.type === 'optional' && jsonResult.value) {
      return {
        price: parseInt(jsonResult.value.price.value),
        seller: jsonResult.value.seller.value,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting token listing:', error);
    return null;
  }
};