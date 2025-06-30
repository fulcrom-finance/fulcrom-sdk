import { BigNumber } from "@ethersproject/bignumber";
import { getContractAddress } from "../config";
import { getTotalSupply } from "../query/erc20/totalSupply";
import { ChainId, TokenInfo } from "../types";
import { getTotalWeight } from "../query/totalWeight";
import { getMarginFeeBasisPoints } from "../query/marginFeeBasisPoints";
import { isIncreaseOrder } from "./getOrders";
import { TradeOrder } from "../query/graphql";
import { Position } from "../types/position";
import { estimateIncreaseOrderLeverage } from "./estimateIncreaseOrderLeverage";
import { estimateIncreaseOrderLeverageNewPosition } from "./estimateIncreaseOrderLeverageNewPosition";
import { estimateDecreaseOrderLeverage } from "./estimateDecreaseOrderLeverage";
import { cacheKeys, getDataWithCache } from "../cache";

export const getLeverageChange = async (
  {
    chainId,
    order,
    position,
    indexTokenInfo,
    purchaseTokenInfo,
    collateralTokenInfo,
  }: {
    chainId: ChainId;
    order: TradeOrder;
    position?: Position;
    indexTokenInfo: TokenInfo;
    purchaseTokenInfo: TokenInfo;
    collateralTokenInfo: TokenInfo;
  },
  caches: Map<string, any>
) => {
  const usdgSupply = await getDataWithCache<BigNumber, [ChainId, string]>(
    caches,
    cacheKeys.UsdgSypply,
    getTotalSupply,
    chainId,
    getContractAddress("USDG", chainId)
  );

  const totalWeight = await getDataWithCache(
    caches,
    cacheKeys.TotalWeight,
    getTotalWeight,
    chainId
  );

  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );

  if (isIncreaseOrder(order)) {
    const to = position
      ? estimateIncreaseOrderLeverage({
          chainId,
          order,
          position,
          marginFeeBasisPoints,
          purchaseTokenInfo,
        })
      : estimateIncreaseOrderLeverageNewPosition({
          order,
          totalWeight,
          usdgSupply,
          marginFeeBasisPoints,
          indexToken: indexTokenInfo,
          fromTokenInfo: purchaseTokenInfo,
          collateralTokenInfo: collateralTokenInfo,
        });

    return {
      from: position?.leverage,
      to,
    };
  } else {
    return {
      from: position?.leverage,
      to: estimateDecreaseOrderLeverage({
        chainId,
        order,
        position,
        marginFeeBasisPoints,
      }),
    };
  }
};
