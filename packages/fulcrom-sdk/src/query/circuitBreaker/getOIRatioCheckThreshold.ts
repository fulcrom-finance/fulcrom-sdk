import { getCircuitBreaker } from "../../contracts/CircuitBreaker";
import { Address, ChainId } from "../../types";

export const getOIRatioCheckThreshold = (
  chainId: ChainId,
  tokenAddress: Address
) => {
  const circuitBreaker = getCircuitBreaker({ chainId });

  return circuitBreaker.oiRatioCheckThreshold(tokenAddress);
};
