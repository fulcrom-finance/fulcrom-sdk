import { getIsInsaneModeEnabled } from "./getIsInsaneMode";
import { Address, ChainId } from "../../types";
import { MAX_LEVERAGE, MAX_LEVERAGE_INSANE } from "../../config";
import { getChainName } from "../getChainName";

export const getUserMaxLeverage = async ({
  chainId,
  account,
}: {
  chainId: ChainId;
  account: Address;
}) => {
  const isInsane = await getIsInsaneModeEnabled({ chainId, account });

  return isInsane ? MAX_LEVERAGE_INSANE[getChainName(chainId)] : MAX_LEVERAGE;
};
