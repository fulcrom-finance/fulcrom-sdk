import { formatAmount } from "../utils/numbers/formatAmount";
import { ValidateOrderResult, ValidateOrderResultType } from "./validateOrder";

export interface getOrderErrorFromValidationResult {
  result: ValidateOrderResult;
}

export const getOrderErrorFromValidationResult = ({
  result,
}: getOrderErrorFromValidationResult): string | undefined => {
  switch (result.type) {
    case ValidateOrderResultType.isValid: {
      return undefined;
    }
    case ValidateOrderResultType.wouldReduceLeverage: {
      return "Order cannot be executed as it would reduce the position's leverage";
    }
    case ValidateOrderResultType.wouldReduceLeverageBelowOne: {
      return "Order cannot be executed as it would reduce the position's leverage below 1";
    }
    case ValidateOrderResultType.noPositionOpened: {
      return "No Positions Opened";
    }
    case ValidateOrderResultType.orderSizeExceedsPositionSize: {
      return "Order Size Exceeds Position Size";
    }
    case ValidateOrderResultType.leftoverCollateralLowerThanMin: {
      const { amount, decimals } = result.minCollateral;

      return `Leftover collateral below ${formatAmount(amount, {
        decimals,
        displayDecimals: 0,
      })} USD`;
    }
    case ValidateOrderResultType.leftoverSizeLowerThanMin: {
      const { amount, decimals } = result.minPositionSize;

      return `Leftover size below ${formatAmount(amount, {
        decimals,
        displayDecimals: 0,
      })} USD`;
    }
    case ValidateOrderResultType.overMaxLeverage: {
      return `Order cannot be executed as it over the max leverage ${result.maxLeverage}x`;
    }

    default: {
      return undefined;
    }
  }
};
