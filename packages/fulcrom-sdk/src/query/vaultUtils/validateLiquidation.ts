import type { BigNumber } from "@ethersproject/bignumber";
import { Address, ChainId } from "../../types";
import { getVaultUtils } from "../../contracts/VaultUtils";

export const validateLiquidation = async ({
  account,
  chainId,
  collateralToken,
  indexToken,
  isLong,
  raise = false,
}: {
  account: Address;
  chainId: ChainId;
  collateralToken: Address;
  indexToken: Address;
  isLong: boolean;
  raise?: boolean;
}): Promise<BigNumber> => {
  const vault = getVaultUtils({ chainId });
  const response = await vault.validateLiquidationForBot(
    account,
    collateralToken,
    indexToken,
    isLong,
    raise
  );

  return response[0]; // only check first param , 0 -> normal position / 1 -> full liq / 2 -> partial liq
};
