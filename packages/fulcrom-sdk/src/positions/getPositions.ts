import {
  BASIS_POINTS_DIVISOR,
  FUNDING_RATE_PRECISION,
  getIndexTokens,
} from "../config";
import { BIG_NUM_ZERO } from "../config/zero";
import { getFundingRateMapFn } from "../query/reader/getFundingRateMap";
import {
  getPositionDataFn,
  toRawPosition,
} from "../query/reader/getPositionDataFn";
import { getFixedLiquidationFeeUsd } from "../query/vault/getFixedLiquidationFeeUsd";
import { getMaxLiquidationLeverage } from "../query/vault/getMaxLiquidationLeverage";
import { getMarginFeeBasisPoints } from "../query/marginFeeBasisPoints";
import { Address, ChainId } from "../types";
import { Position } from "../types/position";
import { getTokensInfo } from "../utils/getTokensInfo";
import { BigNumber } from "@ethersproject/bignumber";
import {
  getDelta,
  getDeltaPercentage,
  getHasLowCollateral,
  getHasProfit,
  getHasProfitAfterFees,
  getLiqPrice,
  getNetValue,
  getNetValueAfterFees,
  getPendingDelta,
  getPendingDeltaAfterFees,
  getPositionLeverage,
} from "../utils/position";
import { getDeltaPercentageAfterFees } from "../utils/getDeltaPercentageAfterFees";
import { cacheKeys, getDataWithCache } from "../cache";

export const getPositions = async ({
  account,
  chainId,
  caches,
}: {
  account: Address;
  chainId: ChainId;
  caches: Map<string, any>;
}) => {
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );
  const maxLiquidationLeverage = await getDataWithCache(
    caches,
    cacheKeys.MaxLiquidationLeverage,
    getMaxLiquidationLeverage,
    chainId
  );
  const fixedLiquidationFeeUsd = await getDataWithCache(
    caches,
    cacheKeys.FixedLiquidationFeeUsd,
    getFixedLiquidationFeeUsd,
    chainId
  );

  const fundingRateMap = await getDataWithCache(
    caches,
    cacheKeys.FundingRateMap,
    getFundingRateMapFn,
    chainId
  );
  const positionData = await getDataWithCache(
    caches,
    cacheKeys.Positions,
    getPositionDataFn,
    account,
    chainId
  );

  const tokenInfoMap = await getTokensInfo({
    account,
    chainId,
    tokens: [...getIndexTokens(chainId)],
    caches,
  });
  if (!positionData || !tokenInfoMap || !fundingRateMap) return;

  const positionDataWithExtra = toRawPosition(positionData).map(
    (rawPosition) => {
      const {
        averagePrice: _averagePrice,
        collateral: _collateral,
        collateralToken,
        delta: _delta,
        entryFundingRate: _entryFundingRate,
        hasProfit: _hasProfit,
        hasRealisedProfit,
        indexToken,
        isLong,
        key,
        lastIncreasedTime,
        realisedPnl,
        size: _size,
      } = rawPosition;
      // const updatedPosition = updatedPositionMap[key];

      const size = _size;
      const collateral = _collateral;
      const averagePrice = _averagePrice;
      const entryFundingRate = _entryFundingRate;
      // if (!skipPositionUpdate && updatedPosition) {
      //   size = updatedPosition.size;
      //   collateral = updatedPosition.collateral;
      //   averagePrice = updatedPosition.averagePrice;
      //   entryFundingRate = updatedPosition.entryFundingRate;
      // }
      const fundingRate = fundingRateMap[collateralToken];
      const indexTokenInfo = tokenInfoMap[indexToken];
      const markPrice =
        (isLong ? indexTokenInfo.minPrice : indexTokenInfo.maxPrice) ??
        BigNumber.from(0);

      const cumulativeFundingRate = BigNumber.from(
        fundingRate.cumulativeFundingRate
      );

      const fundingFee =
        entryFundingRate && cumulativeFundingRate
          ? size
              .mul(cumulativeFundingRate.sub(entryFundingRate))
              .div(FUNDING_RATE_PRECISION)
          : BigNumber.from(0);

      const collateralAfterFee = collateral.sub(fundingFee);
      const closingFee = size
        .mul(marginFeeBasisPoints)
        .div(BASIS_POINTS_DIVISOR);
      const positionFee = size
        .mul(marginFeeBasisPoints)
        .mul(2)
        .div(BASIS_POINTS_DIVISOR);
      const totalFees = positionFee.add(fundingFee);

      const pendingDelta = getPendingDelta({
        _delta,
        size,
        averagePrice,
        markPrice,
        collateral,
      });
      const hasProfit = getHasProfit({
        _hasProfit,
        isLong,
        markPrice,
        averagePrice,
        collateral,
      });
      const hasLowCollateral = getHasLowCollateral({
        collateral,
        collateralAfterFee,
        size,
      });
      const hasProfitAfterFees = getHasProfitAfterFees({
        hasProfit,
        totalFees,
        pendingDelta,
      });
      const deltaPercentage = getDeltaPercentage({
        pendingDelta,
        collateral,
      });
      const netValue = getNetValue({
        collateral,
        pendingDelta,
        hasProfit,
      });
      const netValueAfterFees = getNetValueAfterFees({
        netValue,
        closingFee,
        collateral,
      });
      const delta = getDelta({
        _delta,
        pendingDelta,
        collateral,
        averagePrice,
        markPrice,
      });

      const pendingDeltaAfterFees = getPendingDeltaAfterFees({
        hasProfit,
        totalFees,
        pendingDelta,
      }); // PnL

      const deltaPercentageAfterFees = getDeltaPercentageAfterFees({
        collateral,
        pendingDeltaAfterFees,
      });

      const leverage =
        getPositionLeverage(
          {
            collateral,
            size,
            cumulativeFundingRate,
            delta,
            entryFundingRate,
            hasProfit,
            marginFeeBasisPoints,
          },
          chainId
        ) || BIG_NUM_ZERO;
      const liqPrice =
        getLiqPrice(
          {
            collateral,
            fixedLiquidationFeeUsd,
            isLong,
            maxLiquidationLeverage,
            size,
            averagePrice,
            cumulativeFundingRate,
            delta,
            entryFundingRate,
            hasProfit,
            marginFeeBasisPoints,
          },
          chainId
        ) || BIG_NUM_ZERO;

      // const pendingPosition = pendingPositionMap[key];

      // wether this position has pending change
      // const hasPendingChange =
      //   !skipPositionUpdate &&
      //   !!pendingPosition &&
      //   getHasPendingChange(
      //     {
      //       collateral,
      //       size,
      //     },
      //     pendingPosition,
      //   );

      const positionWithExtra: Position = {
        cumulativeFundingRate,
        closingFee,
        collateralAfterFee,
        deltaPercentage,
        deltaPercentageAfterFees,
        fundingFee,
        hasLowCollateral,
        // hasPendingChange,
        hasProfitAfterFees,
        leverage,
        liqPrice,
        markPrice,
        netValue,
        netValueAfterFees,
        pendingDelta,
        pendingDeltaAfterFees,
        positionFee,
        totalFees,
        averagePrice,
        collateral,
        collateralToken,
        delta,
        entryFundingRate,
        hasProfit,
        hasRealisedProfit,
        indexToken,
        isLong,
        key,
        lastIncreasedTime,
        realisedPnl,
        size,
      };

      return positionWithExtra;
    }
  );

  return positionDataWithExtra;
};
