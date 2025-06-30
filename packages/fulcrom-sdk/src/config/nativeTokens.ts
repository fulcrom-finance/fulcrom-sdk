import type { NativeToken } from "../types";
import { ChainId } from "../types";

export const CRO = (): NativeToken =>
  Object.freeze<NativeToken>({
    decimals: 18,
    image: "/tokens/cro.svg",
    displaySymbol: "CRO",
    symbol: "CRO",
    isNative: true,
    isStable: false,
    address: "0x0",
    name: "CRO",
    displayDecimals: 4,
  });

const createNativeToken = (chainId: ChainId): NativeToken => {
  switch (chainId) {
    case ChainId.CRONOS_MAINNET:
    case ChainId.CRONOS_TESTNET:
    default:
      return CRO();
  }
};
const tokeMemoryCache: Partial<Record<ChainId, NativeToken>> = {};

export const getNativeTokenObj = (chainId: ChainId): NativeToken => {
  const cache = tokeMemoryCache[chainId];
  if (cache) {
    return cache;
  }
  const token = Object.freeze(createNativeToken(chainId));
  tokeMemoryCache[chainId] = token;

  return token;
};
