import { TokenSymbol } from "../../config";
import { ChainId } from "../../types";

export const getDefaultClosePositionReceiveSymbol = (
  chainId: ChainId
): TokenSymbol => {
  switch (chainId) {
    case ChainId.CRONOS_MAINNET:
    case ChainId.CRONOS_TESTNET:
    default:
      return "USDT";
  }
};
