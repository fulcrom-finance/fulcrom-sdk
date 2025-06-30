import type { BigNumber } from "@ethersproject/bignumber";
import type { TokenInfo } from "../../types";
import { BASIS_POINTS_DIVISOR } from "../../config";
import type { IncreaseOrder } from "../../query/graphql/getOrders";
import { getMaxSwapFeeBps } from "./maxSwapFeeBps";
import { expandDecimals } from "../../utils/numbers/expandDecimals";

export const getTradeOrderSwapFee = ({
  order,
  totalWeight,
  usdgSupply,
  toTokenInfo,
  purchaseTokenInfo,
  collateralTokenInfo,
}: {
  order: Pick<
    IncreaseOrder,
    | "isLong"
    | "purchaseTokenAmount"
    | "purchaseToken"
    | "indexToken"
    | "collateralToken"
  >;
  usdgSupply: BigNumber;
  totalWeight: BigNumber;
  toTokenInfo: TokenInfo;
  purchaseTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;
}) => {
  const swapFeeBps = getTradeOrderSwapFeeBps({
    order,
    totalWeight,
    usdgSupply,
    toTokenInfo,
    purchaseTokenInfo,
    collateralTokenInfo,
  });
  const fromAmount = order.purchaseTokenAmount;

  const fromTokenMinPrice = purchaseTokenInfo?.minPrice;
  const fromUsdMin = fromAmount
    .mul(fromTokenMinPrice)
    .div(expandDecimals(purchaseTokenInfo.decimals));

  return fromUsdMin.mul(swapFeeBps).div(BASIS_POINTS_DIVISOR);
};

export const getTradeOrderSwapFeeBps = ({
  order,
  totalWeight,
  usdgSupply,
  toTokenInfo,
  purchaseTokenInfo,
  collateralTokenInfo,
}: {
  order: Pick<
    IncreaseOrder,
    | "isLong"
    | "purchaseTokenAmount"
    | "purchaseToken"
    | "indexToken"
    | "collateralToken"
  >;
  usdgSupply: BigNumber;
  totalWeight: BigNumber;
  toTokenInfo: TokenInfo;
  purchaseTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;
}) => {
  const isLong = order.isLong;
  const fromAmount = order.purchaseTokenAmount;

  const isNeedSwap = getIsNeedSwap({ order, toTokenInfo, purchaseTokenInfo });

  if (!isNeedSwap) return 0;

  return getMaxSwapFeeBps({
    fromAmount,
    fromTokenInfo: purchaseTokenInfo,
    toTokenInfo: isLong ? toTokenInfo : collateralTokenInfo,
    usdgSupply,
    totalWeight,
  });
};

const getIsNeedSwap = ({
  order,
  toTokenInfo,
  purchaseTokenInfo,
}: {
  order: Pick<
    IncreaseOrder,
    "isLong" | "indexToken" | "collateralToken" | "purchaseToken"
  >;
  toTokenInfo: TokenInfo;
  purchaseTokenInfo: TokenInfo;
}) => {
  const isLong = order.isLong;

  const shortCollateralTokenAddress = order.collateralToken;

  const isNeedSwapForLong =
    isLong && purchaseTokenInfo.address !== toTokenInfo.address;

  const isNeedSwapForShort =
    !isLong && purchaseTokenInfo.address !== shortCollateralTokenAddress;

  return isNeedSwapForLong || isNeedSwapForShort;
};
