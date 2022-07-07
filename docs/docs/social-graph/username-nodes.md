# Username Nodes

Usernames 
[EIP-1155](https://eips.ethereum.org/EIPS/eip-1155) based with additional peristent state.  No event indexing required, nft ids and usernames are reverse mapped on chain. (Address => nftids[]) still requires inferring state from event logs)
```
  mapping(string => uint256) usernameToNftId;
  mapping(uint256 => string) nftIdToUsername;

  mapping(uint256 => address) nftIdToAddress;  
  mapping(uint256 => mapping(address => uint256)) nftIdBalances; // erc-1155 for does this address have this nftid? 0 false 1 true
```
Rudimentary Eth deposit box and nonces for [EIP-712](https://eips.ethereum.org/EIPS/eip-712) under it
```
  mapping(uint256 => uint256)  nftIdUsedNonces;
  mapping(uint256 => uint256) nftIdEthDeposits;

```
