import { ChainId, ChainName } from "../types";

const chainIdToChainName: Record<ChainId, ChainName> = {
  [ChainId.CRONOS_MAINNET]: ChainName.CRONOS,
  [ChainId.CRONOS_TESTNET]: ChainName.CRONOS,
};

export const getChainName = (chainId: ChainId): ChainName => {
  return chainIdToChainName[chainId];
};

export const isValidChainName = (chainName: string): chainName is ChainName => {
  return Object.values(ChainName).includes(chainName as any);
};
