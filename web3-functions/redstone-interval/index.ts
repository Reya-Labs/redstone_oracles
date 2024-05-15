import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { BigNumber, Contract, ethers } from "ethers";

import { requestDataPackages } from "@redstone-finance/sdk";
import {
  DataPackagesWrapper,
} from "@redstone-finance/evm-connector";

const parsePrice = (value: Uint8Array) => {
  const bigNumberPrice = ethers.BigNumber.from(value);
  return bigNumberPrice.toNumber() / 10 ** 8; // Redstone uses 8 decimals
}
Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, multiChainProvider, secrets, storage } = context;

  const provider = multiChainProvider.default();

  let abi = [
    "function updateDataFeedsValues(uint256) external",
    "function getDataServiceId() public pure  override returns (string memory)",
    "function getUniqueSignersThreshold() public pure returns (uint8)",
    "function latestRoundData() external view returns (uint80,int256,uint256,int256,uint80)",
    "function decimals() external view returns (uint8)",
  ];

  const priceFeedAdapterAddress = userArgs.priceFeedAdapterAddress as string;


  const priceFeed = userArgs.priceFeed as string;
  if (priceFeed == undefined){
    return { canExec:false, message:"No price feed arg"}
  }


  const priceFeedAdapter = new Contract(priceFeedAdapterAddress, abi, provider);
  const url = (await secrets.get("URL")) as string;

  const latestSignedPrice = await requestDataPackages({
    dataServiceId: "redstone-primary-prod",
    uniqueSignersCount: 3,
    dataFeeds: [priceFeed],
    urls: ["https://oracle-gateway-1.a.redstone.finance","https://oracle-gateway-2.a.redstone.finance", "https://oracle-gateway-1.a.redstone.vip", url],
  });

  // Wrap contract with redstone data service
  const dataPackagesWrapper = new DataPackagesWrapper(
      latestSignedPrice
  );
  const wrappedOracle = dataPackagesWrapper.overwriteEthersContract(priceFeedAdapter);
  // Retrieve stored & live prices

  const { dataPackage } = latestSignedPrice[priceFeed]![0];

  const lastTimestampPackage = await storage.get("lastTimestampPackage") ?? "0"

  if (lastTimestampPackage == dataPackage.timestampMilliseconds.toString()) {
    return {canExec:false, message:"dataPackage not updated!"}
  } else {
    await storage.set("lastTimestampPackage", dataPackage.timestampMilliseconds.toString());
  }


  const parsedPrice = parsePrice(dataPackage.dataPoints[0].value);

  // Craft transaction to update the price on-chain
  console.log(`Setting ${priceFeed} price in PriceFeed contract to: ${parsedPrice}, at ${ dataPackage.timestampMilliseconds}`);
  const { data } =
      await wrappedOracle.populateTransaction.updateDataFeedsValues(
          dataPackage.timestampMilliseconds
      );


  return {
    canExec: true,
    callData: [{ to: priceFeedAdapterAddress, data: data as string }],
  };


});