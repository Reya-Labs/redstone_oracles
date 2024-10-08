// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import  "../RedStoneBaseContracts/redstone-oracles-monorepo/packages/on-chain-relayer/contracts/price-feeds/with-rounds/MergedPriceFeedAdapterWithRounds.sol";

contract RedstonePriceFeedWithRoundsCronosSUSDE is MergedPriceFeedAdapterWithRounds {

  bytes32 constant private SUSDE_ID = bytes32("sUSDe");
  address internal constant MAIN_UPDATER_ADDRESS = 0xd38D35B9946499eB19De9eDEa47F48C44A217d23;
  address internal constant FALLBACK_UPDATER_ADDRESS = 0x653C22AB4836769036B3D4ABf5780bF4245c6D58;

  error UpdaterNotAuthorised(address signer);


  function getDataFeedId() public pure  override returns (bytes32) {
    return SUSDE_ID;
  }

  function requireAuthorisedUpdater(address updater) public view override virtual {
    if (
      updater != MAIN_UPDATER_ADDRESS &&
      updater != FALLBACK_UPDATER_ADDRESS
    ) {
      revert UpdaterNotAuthorised(updater);
    }
  }


  function getDataServiceId() public pure override returns (string memory) {
    return "redstone-primary-prod";
  }

  function getUniqueSignersThreshold() public pure override returns (uint8) {
    return 3;
  }

  function getAuthorisedSignerIndex(
    address signerAddress
  ) public view virtual override returns (uint8) {
    if (signerAddress == 0x8BB8F32Df04c8b654987DAaeD53D6B6091e3B774) {
      return 0;
    } else if (signerAddress == 0xdEB22f54738d54976C4c0fe5ce6d408E40d88499) {
      return 1;
    } else if (signerAddress == 0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202) {
      return 2;
    } else if (signerAddress == 0xDD682daEC5A90dD295d14DA4b0bec9281017b5bE) {
      return 3;
    } else if (signerAddress == 0x9c5AE89C4Af6aA32cE58588DBaF90d18a855B6de) {
      return 4;
    } else {
      revert SignerNotAuthorised(signerAddress);
    }
  }



}
