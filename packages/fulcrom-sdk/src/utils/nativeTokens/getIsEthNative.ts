import { getChainInfo } from "../../config";
import { ChainId } from "../../types";

export const getIsEthNative = (chainId: ChainId) => {
  const chainInfo = getChainInfo(chainId);

  return chainInfo.nativeCurrency.symbol === "ETH";
};
