import { BigNumber } from "@ethersproject/bignumber";
import {
  BASIS_POINTS_DIVISOR_DECIMALS,
  expandDecimals,
  MAX_LEVERAGE_INSANE,
} from "../../config";
import { Position } from "../../types/position";
import { ValidateOrderResult, ValidateOrderResultType } from "./types";
import { IncreaseOrder } from "../../query/graphql";
import { ChainId, TokenInfo } from "../../types";
import { isIncreaseOrder } from "../getOrders";
import { getChainName } from "../../utils";
import { getPositionLeverage } from "../../utils/position";
import { estimateIncreaseOrderLeverage } from "../estimateIncreaseOrderLeverage";
import { estimateIncreaseOrderLeverageNewPosition } from "../estimateIncreaseOrderLeverageNewPosition";

export function validateIncreaseOrder(params: {
  nextLeverage: bigint;
  position?: Position;
}): ValidateOrderResult;
export function validateIncreaseOrder(params: {
  order: IncreaseOrder;
  chainId: ChainId;
  indexTokenInfo: TokenInfo;
  purchaseTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;
  position?: Position;
  marginFeeBasisPoints: number;
  totalWeight: BigNumber;
  usdgSupply: BigNumber;
}): ValidateOrderResult;
export function validateIncreaseOrder(
  params:
    | {
        nextLeverage: bigint;
        position?: Position;
      }
    | {
        order: IncreaseOrder;
        chainId: ChainId;
        indexTokenInfo: TokenInfo;
        purchaseTokenInfo: TokenInfo;
        collateralTokenInfo: TokenInfo;
        position?: Position;
        marginFeeBasisPoints: number;
        totalWeight: BigNumber;
        usdgSupply: BigNumber;
      }
): ValidateOrderResult {
  if (!params.position) {
    if ("order" in params) {
      const { order, marginFeeBasisPoints, totalWeight, usdgSupply } = params;

      if (isIncreaseOrder(order)) {
        const nextLeverage = estimateIncreaseOrderLeverageNewPosition({
          order,
          totalWeight,
          usdgSupply,
          marginFeeBasisPoints,
          indexToken: params.indexTokenInfo,
          fromTokenInfo: params.purchaseTokenInfo,
          collateralTokenInfo: params.collateralTokenInfo,
        });
        const maxLeverage = MAX_LEVERAGE_INSANE[getChainName(params.chainId)];

        if (
          nextLeverage &&
          nextLeverage.gt(
            expandDecimals(maxLeverage, BASIS_POINTS_DIVISOR_DECIMALS)
          )
        ) {
          return {
            type: ValidateOrderResultType.overMaxLeverage,
            maxLeverage: maxLeverage,
          };
        }
      }
    }

    return {
      type: ValidateOrderResultType.isValid,
    };
  }

  let nextLeverage: bigint | undefined = undefined;
  if ("nextLeverage" in params) {
    nextLeverage = params.nextLeverage;
  } else {
    const {
      chainId,
      order,
      purchaseTokenInfo,
      position,
      marginFeeBasisPoints,
    } = params;
    if (order.isLong && position && purchaseTokenInfo) {
      nextLeverage = getPositionLeverage(
        {
          ...position,
          sizeDelta: order.sizeDelta,
          collateralDelta: order.purchaseTokenAmount
            .mul(purchaseTokenInfo.minPrice)
            .div(expandDecimals(1, purchaseTokenInfo.decimals)),
          isIncreaseCollateral: true,
          isIncreaseSize: true,
          isIncludeDelta: false,
          marginFeeBasisPoints,
        },
        chainId
      )?.toBigInt();
    }

    if (isIncreaseOrder(order)) {
      nextLeverage = estimateIncreaseOrderLeverage({
        chainId,
        order,
        position,
        marginFeeBasisPoints,
        purchaseTokenInfo,
      })?.toBigInt();
    }
  }

  if (nextLeverage) {
    if (
      "chainId" in params &&
      BigNumber.from(nextLeverage).gt(
        expandDecimals(
          MAX_LEVERAGE_INSANE[getChainName(params.chainId)],
          BASIS_POINTS_DIVISOR_DECIMALS
        )
      )
    ) {
      return {
        type: ValidateOrderResultType.overMaxLeverage,
        maxLeverage: MAX_LEVERAGE_INSANE[getChainName(params.chainId)],
      };
    }

    if (
      nextLeverage <= params.position.leverage.mul(99).div(100).toBigInt() &&
      // only long position has such reduce leverage error
      params.position.isLong
    ) {
      return {
        type: ValidateOrderResultType.wouldReduceLeverage,
      };
    }
  }

  return {
    type: ValidateOrderResultType.isValid,
  };
}
