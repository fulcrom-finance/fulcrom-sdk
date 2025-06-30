import { getContractAddress } from "../config";
import { getTotalSupply } from "../query/erc20/totalSupply";
import { DecreaseOrder, IncreaseOrder } from "../query/graphql";
import { getTotalWeight } from "../query/totalWeight";
import { getMarginFeeBasisPoints } from "../query/marginFeeBasisPoints";
import { ChainId, TokenInfo } from "../types";
import { Position } from "../types/position";
import { getOrderErrorFromValidationResult } from "./getOrderErrorFromValidationResult";
import { validateDecreaseOrder, validateIncreaseOrder } from "./validateOrder";
import { cacheKeys, getDataWithCache } from "../cache";

export const getIncreaseOrderError = async ({
  chainId,
  indexTokenInfo,
  purchaseTokenInfo,
  collateralTokenInfo,
  orderData,
  caches,
  position,
}: {
  chainId: ChainId;
  indexTokenInfo: TokenInfo;
  purchaseTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;
  orderData: IncreaseOrder;
  caches: Map<string, any>;
  position?: Position;
}) => {
  if (!orderData) return undefined;

  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );

  const totalWeight = await getDataWithCache(
    caches,
    cacheKeys.TotalWeight,
    getTotalWeight,
    chainId
  );
  const usdgSupply = await getDataWithCache(
    caches,
    cacheKeys.UsdgSypply,
    getTotalSupply,
    chainId,
    getContractAddress("USDG", chainId)
  );

  const result = validateIncreaseOrder({
    order: orderData,
    chainId,
    indexTokenInfo,
    purchaseTokenInfo,
    collateralTokenInfo,
    position,
    marginFeeBasisPoints,
    totalWeight,
    usdgSupply,
  });

  return getOrderErrorFromValidationResult({ result });
};

export const getDecreaseOrderError = async (
  orderData: DecreaseOrder,
  position?: Position
) => {
  if (!orderData) return undefined;

  const result = validateDecreaseOrder({
    order: orderData,
    position,
  });

  return getOrderErrorFromValidationResult({ result });
};
