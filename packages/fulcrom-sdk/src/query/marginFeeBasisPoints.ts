import type { ChainId } from "../types";
import { getChainName } from "../utils";
import { getTimelock } from "../contracts/Timelock";
import { MARGIN_FEE_BASIS_POINTS_FALLBACK } from "../config/constants";

export const getMarginFeeBasisPoints = async (
  chainId: ChainId
): Promise<number> => {
  const timelock = getTimelock({ chainId });
  const response = await timelock.marginFeeBasisPoints();

  return (
    response?.toNumber() ??
    MARGIN_FEE_BASIS_POINTS_FALLBACK[getChainName(chainId)]
  );
};
