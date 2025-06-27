export interface ERC721Collection {
  address: string;
  address_hash: string;
  name: string;
  symbol: string;
  type: string;
  holders: string;
  holders_count: string;
  total_supply: string | null;
  icon_url: string | null;
}

export interface ERC721Token {
  id: string;
  owner: {
    hash: string;
  } | null;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  } | null;
  token: ERC721Collection;
}

export interface CollectionResponse {
  items: ERC721Collection[];
  next_page_params: unknown;
}

export interface TokenResponse {
  items: ERC721Token[];
  next_page_params: unknown;
}

class BlockscoutAPI {
  async getERC721Collections(): Promise<ERC721Collection[]> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BLOCKSCOUT_URL}/api/v2/tokens?type=ERC-721`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CollectionResponse = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching ERC721 tokens:', error);
      return [];
    }
  }

  async getCollectionTokens(contractAddress: string): Promise<ERC721Token[]> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BLOCKSCOUT_URL}/api/v2/tokens/${contractAddress}/instances`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TokenResponse = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching collection tokens:', error);
      return [];
    }
  }

  async getUserNFTs(userAddress: string): Promise<ERC721Token[]> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BLOCKSCOUT_URL}/api/v2/addresses/${userAddress}/nft?type=ERC-721`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TokenResponse = await response.json();

      const tokensWithOwner = (data.items || []).map(token => ({
        ...token,
        owner: { hash: userAddress },
      }));

      return tokensWithOwner;
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      return [];
    }
  }
}

export const blockscoutAPI = new BlockscoutAPI();
