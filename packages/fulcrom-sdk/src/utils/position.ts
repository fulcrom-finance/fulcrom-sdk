 
import { BigNumber } from "@ethersproject/bignumber";
import { keccak256 } from "@ethersproject/solidity";
import { Address, ChainId } from "../types";
import {
  BASIS_POINTS_DIVISOR,
  FUNDING_RATE_PRECISION,
  getIndexTokens,
} from "../config";
import { BIG_NUM_ZERO } from "../config/zero";

// Position: Long/Short
// - Index Token: the token to be Long or Short
// - Collateral Token: the token to be used as collateral for the position
// - Pay Token: the token used to pay as collateral
// - If pay token is not the same as collateral token, it will be converted to collateral token
// - Positions are identified by the combination of (account, collateralToken, indexToken, isLong).
//
// Long
// 1. IndexToken and Collateral token must be the same and can't be stablecoin
// 2. A snapshot of the USD value of the collateral is taken when the position is opened
//
// Short
// 1. IndexToken and collateral token must not be the same
// 2. IndexToken can't be stable coin
// 3. collateral token must be one of the supported stable coin

export type PositionKey = string;

/**
 * the position key used in the smart contact side
 *
 * @param account
 * @param collateralToken
 * @param indexToken
 * @param isLong
 * @returns
 */
export const getPositionKey = (
  account: Address,
  collateralToken: Address,
  indexToken: Address,
  isLong: boolean
): PositionKey => {
  return keccak256(
    ["address", "address", "address", "bool"],
    [account, collateralToken, indexToken, isLong]
  );
};

/**
 * positions are identified with the combination of:
 * (account, index token address, index token address, isLong)
 */
export const getPositionsQuery = (chainId: ChainId) => {
  const indexTokens = [];
  const collateralTokens = [];
  const isLongs = [];
  const tokens = [...getIndexTokens(chainId)];

  // find out all the possible long position keys
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // can't Long stable coins
    if (token.isStable) continue;

    // for Long position, the index token and the collateral token must be the same
    collateralTokens.push(token.address);
    indexTokens.push(token.address);
    isLongs.push(true);
  }

  // find out all the possible short position keys
  for (let i = 0; i < tokens.length; i++) {
    const stableToken = tokens[i];
    if (!stableToken.isStable) continue;

    for (let j = 0; j < tokens.length; j++) {
      const token = tokens[j];
      // short token can't be stable coin
      if (token.isStable) continue;

      // short collateral token must be a stable token
      collateralTokens.push(stableToken.address);
      indexTokens.push(token.address);
      isLongs.push(false);
    }
  }

  return { collateralTokens, indexTokens, isLongs };
};

const getAllPossiblePositionKeys = (
  account: Address,
  chainId: ChainId
): PositionKey[] => {
  const { collateralTokens, indexTokens, isLongs } = getPositionsQuery(chainId);

  return collateralTokens.map((collateralToken, idx) =>
    getPositionKey(account, collateralToken, indexTokens[idx], isLongs[idx])
  );
};

export const getIsPositionOf = (
  account: Address,
  key: PositionKey,
  chainId: ChainId
) => getAllPossiblePositionKeys(account, chainId).some((v) => v === key);

// Liquidation price for Long:
// =====================================================================
//
// Condition A: when the position collateral is not enough to pay off the fees, the position may got liquidated.
// liq_price_A is calculated based on Condition A
// -------------------------------
// collateral = fees + position_size * (average_price - liq_price_A) / average_price
// liq_price_A = average_price - ((collateral - fees) * average_price) / position_size
//
// Condition B: When the remaining collateral is less than position_size/max_leverage, the position may got liquidated.
//  liq_price_B is calculated based on Condition B.
// ----------------------------------------
// position_size / max_leverage = collateral - position_size * (average_price - liq_price_B) / average_price
//
// The finally liquidation price is calculated as the following:
// ----------------------------------------
// liq_price = Math.max(liq_price_A, liq_price_B)
//
// where
//
// - fees = position_fee + liquidation_fee + borrow_fee
// 	 - position_fee = open_position_fee + close_position_fee
// 	  - open_position_fee = size_delta * 0.1%
// 	  - close_position_fee = (position_size + size_delta) * 0.1%
// 	 - liquidation_fee = $5 // 11/24/2023 update, this fee can be changed per contract config, update it to fetch from contract
// 	 - borrow_fee is calculated based on the borrow time and borrow rate.
// - max_leverage is 150 // 15/04/2024 update, this fee can be changed per contract config, update it to fetch from contract
//
// Liquidation price for short:
// =====================================================================
// Liquidation price for short can be calculated similarly

// !! IMPORTANT !!
// `HistoryDetailsBreakdown.tsx` is using this function to calculate the liquidation price,
// which is for display liquidation price in historical trade events.
//
// At the time we implemented that component, we decided reuse this same function to
// calculate the liquidation price based on events, instead of recording the liquidation price
// in subgraph.
//
// So if you plan to change this `getLiqPrice` function, please come up with a new solution for
// `HistoryDetailsBreakdown.tsx` first.
export function getLiqPrice(
  {
    isLong,
    size,
    collateral,
    averagePrice,
    entryFundingRate,
    cumulativeFundingRate,
    sizeDelta,
    collateralDelta,
    isIncreaseCollateral,
    isIncreaseSize,
    delta,
    hasProfit,
    isIncludeDelta,
    maxLiquidationLeverage,
    fixedLiquidationFeeUsd,
    marginFeeBasisPoints,
  }: {
    isLong: boolean;
    size: BigNumber;
    collateral: BigNumber;
    averagePrice?: BigNumber;
    entryFundingRate?: BigNumber;
    cumulativeFundingRate?: BigNumber;
    sizeDelta?: BigNumber;
    /** must be before fee collateral delta */
    collateralDelta?: BigNumber;
    isIncreaseCollateral?: boolean;
    isIncreaseSize?: boolean;
    delta?: BigNumber;
    hasProfit?: boolean;
    isIncludeDelta?: boolean;
    maxLiquidationLeverage: BigNumber | number | undefined;
    fixedLiquidationFeeUsd: BigNumber | undefined;
    marginFeeBasisPoints: number;
  },
  chainId: ChainId
): BigNumber | undefined {
  if (
    !averagePrice?.gt(0) ||
    !maxLiquidationLeverage ||
    !fixedLiquidationFeeUsd
  )
    return undefined;

  let nextSize = size;
  let nextCollateral = collateral;
  let openPositionFee = BIG_NUM_ZERO;

  if (sizeDelta) {
    if (isIncreaseSize) {
      nextSize = size.add(sizeDelta);
      openPositionFee = getMarginFee(sizeDelta, marginFeeBasisPoints);
    } else {
      if (sizeDelta.gte(size)) return undefined;
      nextSize = size.sub(sizeDelta);
    }

    if (isIncludeDelta && !hasProfit && delta && size.gt(0)) {
      const adjustedDelta = sizeDelta.mul(delta).div(size);
      nextCollateral = nextCollateral.sub(adjustedDelta);
    }
  }

  if (collateralDelta) {
    if (isIncreaseCollateral) {
      nextCollateral = nextCollateral.add(collateralDelta);
    } else {
      if (collateralDelta.gte(nextCollateral)) return undefined;

      nextCollateral = nextCollateral.sub(collateralDelta);
    }
  }
  const closePositionFees = getMarginFee(nextSize, marginFeeBasisPoints);

  let fundingFee = BIG_NUM_ZERO;
  if (entryFundingRate && cumulativeFundingRate) {
    fundingFee = size
      .mul(cumulativeFundingRate.sub(entryFundingRate))
      .div(FUNDING_RATE_PRECISION);
  }
  const fees = closePositionFees
    .add(openPositionFee)
    .add(fixedLiquidationFeeUsd)
    .add(fundingFee);

  const liqPriceForFees = getLiqPriceFromDelta({
    liqAmount: fees,
    size: nextSize,
    collateral: nextCollateral,
    averagePrice,
    isLong,
  });

  const liqPriceForMaxLeverage = getLiqPriceFromDelta({
    liqAmount: nextSize.mul(BASIS_POINTS_DIVISOR).div(maxLiquidationLeverage),
    size: nextSize,
    collateral: nextCollateral,
    averagePrice,
    isLong,
  });

  if (!liqPriceForFees) return liqPriceForMaxLeverage;
  if (!liqPriceForMaxLeverage) return liqPriceForFees;

  // return the higher price for long
  if (isLong)
    return liqPriceForFees.gt(liqPriceForMaxLeverage)
      ? liqPriceForFees
      : liqPriceForMaxLeverage;

  // return the lower price for short
  return liqPriceForFees.lt(liqPriceForMaxLeverage)
    ? liqPriceForFees
    : liqPriceForMaxLeverage;
}

export const getMarginFee = (
  sizeDelta: BigNumber,
  marginFeeBasisPoints: number
) => {
  if (sizeDelta.eq(0)) return BigNumber.from(0);

  const afterFeeUsd = sizeDelta
    .mul(BASIS_POINTS_DIVISOR - marginFeeBasisPoints)
    .div(BASIS_POINTS_DIVISOR);

  return sizeDelta.sub(afterFeeUsd);
};

export const getLiqPriceFromDelta = ({
  liqAmount,
  size,
  collateral,
  averagePrice,
  isLong,
}: {
  liqAmount: BigNumber;
  size: BigNumber;
  collateral: BigNumber;
  averagePrice: BigNumber;
  isLong: boolean;
}): BigNumber | undefined => {
  if (!size.gt(0)) return undefined;

  if (liqAmount.gt(collateral)) {
    const liqDelta = liqAmount.sub(collateral);
    const priceDelta = liqDelta.mul(averagePrice).div(size);

    return isLong ? averagePrice.add(priceDelta) : averagePrice.sub(priceDelta);
  }

  const liqDelta = collateral.sub(liqAmount);
  const priceDelta = liqDelta.mul(averagePrice).div(size);

  return isLong ? averagePrice.sub(priceDelta) : averagePrice.add(priceDelta);
};

export const getNextAveragePrice = ({
  size,
  sizeDelta,
  hasProfit,
  delta,
  nextPrice,
  isLong,
}: {
  size: BigNumber;
  sizeDelta: BigNumber;
  hasProfit: boolean;
  delta: BigNumber;
  nextPrice: BigNumber;
  isLong: boolean;
}): BigNumber | undefined => {
  if (!size || !sizeDelta || !delta || !nextPrice) return;

  const nextSize = size.add(sizeDelta);
  let divisor: BigNumber | undefined;

  if (isLong) {
    divisor = hasProfit ? nextSize.add(delta) : nextSize.sub(delta);
  } else {
    divisor = hasProfit ? nextSize.sub(delta) : nextSize.add(delta);
  }

  if (!divisor || divisor.eq(0)) return;

  const nextAveragePrice = nextPrice.mul(nextSize).div(divisor);

  return nextAveragePrice;
};

export function getPositionLeverage(
  {
    size,
    sizeDelta,
    isIncreaseSize,
    collateral,
    collateralDelta,
    isIncreaseCollateral,
    entryFundingRate,
    cumulativeFundingRate,
    hasProfit,
    delta,
    isIncludeDelta,
    marginFeeBasisPoints,
  }: {
    size: BigNumber;
    sizeDelta?: BigNumber;
    isIncreaseSize?: boolean;
    collateral: BigNumber;
    collateralDelta?: BigNumber;
    isIncreaseCollateral?: boolean;
    entryFundingRate?: BigNumber;
    cumulativeFundingRate?: BigNumber;
    hasProfit?: boolean;
    delta?: BigNumber;
    isIncludeDelta?: boolean;
    marginFeeBasisPoints: number;
  },
  chainId: ChainId
): BigNumber | undefined {
  if (!size.gt(0) && !sizeDelta?.gt(0)) return undefined;
  if (!collateral.gt(0) && !collateralDelta?.gt(0)) return undefined;

  let nextSize = size ? size : BigNumber.from(0);

  if (sizeDelta?.gt(0)) {
    if (isIncreaseSize) {
      nextSize = size.add(sizeDelta);
    } else {
      if (sizeDelta.gte(size)) return undefined;
      nextSize = size.sub(sizeDelta);
    }
  }

  let remainingCollateral = collateral ? collateral : BigNumber.from(0);

  if (collateralDelta?.gt(0)) {
    if (isIncreaseCollateral) {
      remainingCollateral = collateral.add(collateralDelta);
    } else {
      if (collateralDelta.gte(collateral)) return undefined;

      remainingCollateral = collateral.sub(collateralDelta);
    }
  }

  if (delta && isIncludeDelta) {
    if (hasProfit) {
      remainingCollateral = remainingCollateral.add(delta);
    } else {
      if (delta.gt(remainingCollateral)) return undefined;

      remainingCollateral = remainingCollateral.sub(delta);
    }
  }

  if (remainingCollateral.eq(0)) return undefined;

  remainingCollateral = sizeDelta
    ? remainingCollateral
        .mul(BASIS_POINTS_DIVISOR - marginFeeBasisPoints)
        .div(BASIS_POINTS_DIVISOR)
    : remainingCollateral;

  if (entryFundingRate && cumulativeFundingRate) {
    const fundingFee = size
      .mul(cumulativeFundingRate.sub(entryFundingRate))
      .div(FUNDING_RATE_PRECISION);
    remainingCollateral = remainingCollateral.sub(fundingFee);
  }

  return nextSize.mul(BASIS_POINTS_DIVISOR).div(remainingCollateral);
}

export function getPendingDeltaAfterFees({
  hasProfit,
  totalFees,
  pendingDelta,
}: {
  hasProfit: boolean;
  totalFees: BigNumber;
  pendingDelta: BigNumber;
}) {
  let pendingDeltaAfterFees = BIG_NUM_ZERO;

  if (hasProfit) {
    if (pendingDelta.gt(totalFees)) {
      pendingDeltaAfterFees = pendingDelta.sub(totalFees);
    } else {
      pendingDeltaAfterFees = totalFees.sub(pendingDelta);
    }
  } else {
    pendingDeltaAfterFees = pendingDelta.add(totalFees);
  }

  return pendingDeltaAfterFees;
}

export function getPendingDelta({
  _delta,
  size,
  averagePrice,
  markPrice,
  collateral,
}: {
  _delta: BigNumber;
  size: BigNumber;
  averagePrice: BigNumber;
  markPrice: BigNumber;
  collateral: BigNumber;
}) {
  let pendingDelta = _delta;

  if (collateral.gt(0) && averagePrice.gt(0) && markPrice) {
    const priceDelta = averagePrice.gt(markPrice)
      ? averagePrice.sub(markPrice)
      : markPrice.sub(averagePrice);

    pendingDelta = size.mul(priceDelta).div(averagePrice);
  }

  return pendingDelta;
}

export function getHasProfit({
  _hasProfit,
  isLong,
  markPrice,
  averagePrice,
  collateral,
}: {
  _hasProfit: boolean;
  isLong: boolean;
  markPrice: BigNumber;
  averagePrice: BigNumber;
  collateral: BigNumber;
}) {
  let hasProfit = _hasProfit;

  if (collateral.gt(0) && averagePrice.gt(0) && markPrice) {
    hasProfit = isLong
      ? markPrice.gte(averagePrice)
      : markPrice.lte(averagePrice);
  }

  return hasProfit;
}

export function getHasProfitAfterFees({
  hasProfit,
  totalFees,
  pendingDelta,
}: {
  hasProfit: boolean;
  totalFees: BigNumber;
  pendingDelta: BigNumber;
}) {
  let hasProfitAfterFees = false;

  if (hasProfit) {
    if (pendingDelta.gt(totalFees)) {
      hasProfitAfterFees = true;
    } else {
      hasProfitAfterFees = false;
    }
  } else {
    hasProfitAfterFees = false;
  }

  return hasProfitAfterFees;
}

export function getHasLowCollateral({
  collateral,
  collateralAfterFee,
  size,
}: {
  collateral: BigNumber;
  collateralAfterFee: BigNumber;
  size: BigNumber;
}) {
  let hasLowCollateral = false;

  if (collateral.gt(0)) {
    hasLowCollateral =
      collateralAfterFee.lt(0) || size.div(collateralAfterFee.abs()).gt(50);
  }

  return hasLowCollateral;
}

export function getDelta({
  _delta,
  pendingDelta,
  collateral,
  averagePrice,
  markPrice,
}: {
  _delta: BigNumber;
  pendingDelta: BigNumber;
  collateral: BigNumber;
  averagePrice: BigNumber;
  markPrice: BigNumber;
}) {
  let delta = _delta;

  if (collateral.gt(0) && averagePrice.gt(0) && markPrice) {
    delta = pendingDelta;
  }

  return delta;
}

export function getNetValue({
  collateral,
  pendingDelta,
  hasProfit,
}: {
  collateral: BigNumber;
  pendingDelta: BigNumber;
  hasProfit: boolean;
}) {
  let netValue = BIG_NUM_ZERO;

  if (collateral.gt(0)) {
    netValue = hasProfit
      ? collateral.add(pendingDelta)
      : collateral.sub(pendingDelta);
  }

  return netValue;
}

export function getNetValueAfterFees({
  netValue,
  closingFee,
  collateral,
}: {
  netValue: BigNumber;
  closingFee: BigNumber;
  collateral: BigNumber;
}) {
  let netValueAfterFees = BIG_NUM_ZERO;

  if (collateral.gt(0)) {
    netValueAfterFees = netValue.sub(closingFee);
  }

  return netValueAfterFees;
}

export function getDeltaPercentage({
  pendingDelta,
  collateral,
}: {
  pendingDelta: BigNumber;
  collateral: BigNumber;
}) {
  let deltaPercentage = BIG_NUM_ZERO;

  if (collateral.gt(0)) {
    deltaPercentage = pendingDelta.mul(BASIS_POINTS_DIVISOR).div(collateral);
  }

  return deltaPercentage;
}
