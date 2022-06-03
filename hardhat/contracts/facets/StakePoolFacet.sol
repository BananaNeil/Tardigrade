pragma solidity 0.8.14;

import { LibAppStorage, AppStorage, Modifiers } from '../libraries/LibAppStorage.sol';

contract StakePoolFacet {
  // protocol owned liquidity fees fund sci-hub

  function getStakePoolCawBalance() external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.stakePoolCaw;
  }

  function getStakePoolCawUSDCBalance() external view returns (uint256) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.stakePoolCawUSDC;
  }
}
