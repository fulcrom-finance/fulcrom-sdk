import { VaultReader } from "../abis";
import { getContractAddress } from "../config";
import type { Contracts } from "../types";
import type { GetContractOptionsByChainId } from "../utils";
import { getContract } from "../utils";

export const getVaultReader = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.VaultReader>(
    getContractAddress("VaultReader", options.chainId),
    VaultReader,
    options
  );
};
