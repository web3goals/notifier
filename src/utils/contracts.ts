import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { GOAL_CONTRACT_ABI } from "../constants/contracts/abi/goalContractAbi";
import { PROFILE_CONTRACT_ABI } from "../constants/contracts/abi/profileContractAbi";
import {
  GOAL_CONTRACT_ADDRESS,
  PROFILE_CONTRACT_ADDRESS,
} from "../constants/contracts/contractAddresses";

dotenv.config();

/**
 * Init provider
 */
const provider = new ethers.providers.AlchemyProvider(
  "matic",
  process.env.ALCHEMY_API_KEY
);

/**
 * Init contract interfaces
 */
const goalContractInterface = new ethers.utils.Interface(GOAL_CONTRACT_ABI);
const profileContractInterface = new ethers.utils.Interface(
  PROFILE_CONTRACT_ABI
);

/**
 * Init contracts
 */
const goalContract = new ethers.Contract(
  GOAL_CONTRACT_ADDRESS,
  goalContractInterface,
  provider
);
const profileContract = new ethers.Contract(
  PROFILE_CONTRACT_ADDRESS,
  profileContractInterface,
  provider
);

export async function getGoalParams(
  goalId: string
): Promise<{ goalAuthor?: string; goalDescription?: string }> {
  const goalParams = await goalContract.getParams(goalId);
  return {
    goalAuthor: goalParams.authorAddress,
    goalDescription: goalParams.description,
  };
}

export async function getProfileUri(profileOwnerAddress: string): Promise<{
  profileUri?: string;
}> {
  const profileUri = await profileContract.getURI(profileOwnerAddress);
  return { profileUri };
}

export async function parseTransactionMessagePostedEvent(
  transactionHash: string
): Promise<{
  goalId?: string;
  goalMessageAuthor?: string;
}> {
  const transaction = await provider.getTransactionReceipt(transactionHash);
  for (const log of transaction.logs) {
    try {
      const logDescription = goalContractInterface.parseLog(log);
      if (logDescription.eventFragment.name === "MessagePosted") {
        return {
          goalId: logDescription.args.tokenId.toString(),
          goalMessageAuthor: logDescription.args.message.authorAddress,
        };
      }
    } catch (error) {}
  }
  return {};
}
