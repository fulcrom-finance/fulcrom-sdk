import { ChainId } from "../types";
import { getProvider } from "../utils";

export const getGasPrice = (chainId: ChainId) => {
  const provider = getProvider(chainId);

  return provider?.getGasPrice();
};
