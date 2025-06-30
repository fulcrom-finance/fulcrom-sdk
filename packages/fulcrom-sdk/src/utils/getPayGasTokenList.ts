import { CRO } from "../config/nativeTokens";
import type { PayGasToken } from "../types";
import { ChainId } from "../types";

export const createPayGasTokenList = (chainId: ChainId): PayGasToken[] => {
  switch (chainId) {
    case ChainId.CRONOS_MAINNET:
    case ChainId.CRONOS_TESTNET:
    default:
      return [CRO()];
  }
};
