import { getContractAddress, USD_DECIMALS } from "../../../../config";
import { ZERO_BIG_INT } from "../../../../config/zero";
import { estimateIncreaseOrderLeverage } from "../../../../orders/estimateIncreaseOrderLeverage";
import { estimateIncreaseOrderLeverageNewPosition } from "../../../../orders/estimateIncreaseOrderLeverageNewPosition";
import { getTotalSupply } from "../../../../query/erc20/totalSupply";
import { IncreaseOrder } from "../../../../query/graphql";
import { getTotalWeight } from "../../../../query/totalWeight";
import { ChainId, TokenInfo } from "../../../../types";
import { Position } from "../../../../types/position";
import { parseValue } from "../../../../utils/numbers/parseValue";
import { getMarginFeeBasisPoints } from "../../../../query/marginFeeBasisPoints";
import { cacheKeys, getDataWithCache } from "../../../../cache";

export const getLeverages = async ({
  chainId,
  order,
  position,
  purchaseTokenInfo,
  transactionAmount,
  indexTokenInfo,
  collateralTokenInfo,
  caches,
}: {
  chainId: ChainId;
  order?: IncreaseOrder;
  position?: Position;
  purchaseTokenInfo: TokenInfo;
  transactionAmount: string;
  indexTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;
  caches: Map<string, any>;
}) => {
  const leverages = {
    current: ZERO_BIG_INT,
    next: ZERO_BIG_INT,
  };
  if (!order) {
    return leverages;
  }
  const nextSizeDelta = parseValue(transactionAmount, USD_DECIMALS);
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );
  if (position) {
    leverages.current =
      estimateIncreaseOrderLeverage({
        position,
        order,
        chainId,
        marginFeeBasisPoints,
        purchaseTokenInfo,
      })?.toBigInt() || ZERO_BIG_INT;
    leverages.next =
      estimateIncreaseOrderLeverage({
        position,
        order: { ...order, sizeDelta: nextSizeDelta },
        chainId,
        marginFeeBasisPoints,
        purchaseTokenInfo,
      })?.toBigInt() || ZERO_BIG_INT;
  } else {
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
    leverages.current =
      estimateIncreaseOrderLeverageNewPosition({
        order,
        totalWeight,
        usdgSupply,
        marginFeeBasisPoints,
        indexToken: indexTokenInfo,
        fromTokenInfo: purchaseTokenInfo,
        collateralTokenInfo: collateralTokenInfo,
      })?.toBigInt() || ZERO_BIG_INT;
    leverages.next =
      estimateIncreaseOrderLeverageNewPosition({
        order: {
          ...order,
          sizeDelta: nextSizeDelta,
        },
        totalWeight,
        usdgSupply,
        marginFeeBasisPoints,
        indexToken: indexTokenInfo,
        fromTokenInfo: purchaseTokenInfo,
        collateralTokenInfo: collateralTokenInfo,
      })?.toBigInt() || ZERO_BIG_INT;
  }

  return leverages;
};
