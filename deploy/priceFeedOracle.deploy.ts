import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name !== "hardhat") {
    console.log(
      `Deploying PriceFeedOracleWithAdapter to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  const priceFeeds = [
    "ETH", 
    "BTC", 
    "WBTC", 
    "USDC", 
    "USDT", 
    "DAI", 
    "SOL", 
    "ARB", 
    "OP", 
    "AVAX", 
    "USDE", 
    "MKR", 
    "LINK",
    "AAVE",
    "CRV",
    "UNI",
    "SUSDE"
  ]

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

 
  for (const priceFeed of priceFeeds) {

  let arifact = `RedstonePriceFeedWithRounds${priceFeed}`  
  const adapterETH= await deploy(arifact, {
    from: deployer,
    log: hre.network.name !== "hardhat",
    proxy: {
      proxyContract: "EIP173Proxy",
    },
  });
  console.log(
    `Deployed Price Feed ${priceFeed} to ${adapterETH.address}`
  );


  }

  
};

export default func;

func.tags = ["ETHWR"];

