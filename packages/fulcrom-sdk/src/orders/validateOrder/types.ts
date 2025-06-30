import type { BigNumber } from "@ethersproject/bignumber";

export enum ValidateOrderResultType {
  isValid = "isValid",
  wouldReduceLeverage = "wouldReduceLeverage",
  wouldReduceLeverageBelowOne = "wouldReduceLeverageBelowOne",
  noPositionOpened = "noPositionOpened",
  orderSizeExceedsPositionSize = "orderSizeExceedsPositionSize",
  leftoverCollateralLowerThanMin = "leftoverCollateralLowerThanMin",
  leftoverSizeLowerThanMin = "leftoverSizeLowerThanMin",
  overMaxLeverage = "overMaxLeverage",
}

export type ValidateOrderResult =
  | {
      type: ValidateOrderResultType.isValid;
    }
  | { type: ValidateOrderResultType.wouldReduceLeverage }
  | { type: ValidateOrderResultType.wouldReduceLeverageBelowOne }
  | { type: ValidateOrderResultType.noPositionOpened }
  | { type: ValidateOrderResultType.orderSizeExceedsPositionSize }
  | {
      type: ValidateOrderResultType.leftoverCollateralLowerThanMin;
      minCollateral: {
        amount: BigNumber;
        decimals: number;
      };
    }
  | {
      type: ValidateOrderResultType.leftoverSizeLowerThanMin;
      minPositionSize: {
        amount: BigNumber;
        decimals: number;
      };
    }
  | {
      type: ValidateOrderResultType.overMaxLeverage;
      maxLeverage: number;
    };
