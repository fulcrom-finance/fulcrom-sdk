import type { ContractInterface } from "@ethersproject/contracts";
import { Contract } from "@ethersproject/contracts";
import type { ChainId, SignerOrProvider } from "../types";
import { getProvider } from "./getProvider";

export type GetContractOptionsByChainId = {
  signerOrProvider?: SignerOrProvider;
  chainId: ChainId;
};

/**
 * @param address the contract address
 * @param abi the contract abi
 * @param options.chainId the chain on which the contract is deployed
 * @param options.SignerOrProvider signer is required when you need to write to the contract.
 * @returns the contract instance
 *
 */
export function getContract<T extends Contract = Contract>(
  address: string,
  abi: ContractInterface,
  { signerOrProvider, chainId }: GetContractOptionsByChainId
): T {
  return new Contract(
    address,
    abi,
    signerOrProvider ?? getProvider(chainId)
  ) as T;
}
