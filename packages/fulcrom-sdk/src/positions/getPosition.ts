import { Address, ChainId } from "../types";
import { getPositionKey } from "./getPositionKey";
import { getPositions } from "./getPositions";

export const getPosition = async ({
  account,
  toToken,
  chainId,
  isLong,
  collateralTokenAddress,
  caches,
}: {
  account: Address;
  chainId: ChainId;
  toToken: Address;
  isLong: boolean;
  collateralTokenAddress?: Address;
  caches: Map<string, any>;
}) => {
  const positionKey = getPositionKey({
    account,
    toToken,
    isLong,
    collateralTokenAddress,
  });

  const positions = await getPositions({ account, chainId, caches });

  const existingPosition = positions?.find((p) => p.key === positionKey);

  return existingPosition;
};
