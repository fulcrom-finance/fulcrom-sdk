import { ReaderV2 } from "../abis";
import { getContractAddress } from "../config";
import type { Contracts } from "../types";
import type { GetContractOptionsByChainId } from "../utils";
import { getContract } from "../utils";

export const getReaderV2 = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.ReaderV2>(
    getContractAddress("Reader", options.chainId),
    ReaderV2,
    options
  );
};
