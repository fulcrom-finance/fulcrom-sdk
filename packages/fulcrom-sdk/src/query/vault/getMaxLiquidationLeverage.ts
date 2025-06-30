import { getVaultV2 } from "../../contracts/VaultV2";
import { ChainId } from "../../types";

export const getMaxLiquidationLeverage = async (chainId: ChainId) => {
  const vaultV2 = getVaultV2({ chainId });
  return vaultV2.maxLeverage();
};
