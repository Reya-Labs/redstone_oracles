import hre from "hardhat";

import Safe, {
  EthersAdapter,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import SafeApiKit from "@safe-global/api-kit";
import { AutomateSDK, TriggerType } from "@gelatonetwork/automate-sdk";
import { safeAddress } from "../safe";

const { ethers } = hre;

async function main() {

  const [deployer] = await ethers.getSigners(); 

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: deployer,
  });


  const protocolKit = await Safe.create({
    ethAdapter,
    safeAddress,
  });

  const predictedSafeAddress =
    await protocolKit.getAddress();
  console.log({ predictedSafeAddress });

  const isSafeDeployed =
    await protocolKit.isSafeDeployed();
  console.log({ isSafeDeployed });


  const txServiceUrl = 'https://safe-transaction-sepolia.safe.global'
  const service = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter })
 
 
    // Propose transaction to the service 
  const safeTransaction = await service.getTransaction("0x064d939d0f073d041328c02faa8404ac5ef3a196b2301307d21c5595c444fd29")
  const executeTxResponse = await protocolKit.executeTransaction(safeTransaction)
  const receipt = await executeTxResponse.transactionResponse?.wait()

  console.log('Confirmed a transaction with Safe:', safeAddress)
  console.log('- txHash: ', receipt.transactionHash)


}
main();
