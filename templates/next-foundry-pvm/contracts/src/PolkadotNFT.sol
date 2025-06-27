// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { ERC721 } from '@openzeppelin-contracts/token/ERC721/ERC721.sol';
import { ERC721URIStorage } from '@openzeppelin-contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract PolkadotNFT is ERC721, ERC721URIStorage {
  string private s_contractURI;
  uint256 private s_nextTokenId;

  constructor(
    string memory name,
    string memory symbol,
    string memory _contractURI
  ) ERC721(name, symbol) {
    s_contractURI = _contractURI;
  }

  function contractURI() public view returns (string memory) {
    return s_contractURI;
  }

  function safeMint(address to, string memory uri) public {
    uint256 tokenId = s_nextTokenId++;
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC721, ERC721URIStorage) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
