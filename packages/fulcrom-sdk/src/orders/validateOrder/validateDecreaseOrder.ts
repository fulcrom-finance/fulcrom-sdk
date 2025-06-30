import { MIN_COLLATERAL, MIN_POSITION_USD, USD_DECIMALS } from "../../config";
import { DecreaseOrder } from "../../query/graphql";
import { Position } from "../../types/position";
import { type ValidateOrderResult, ValidateOrderResultType } from "./types";

type ValidateDecreaseOrderProps = {
  order: DecreaseOrder;
  position?: Position;
};

export const validateDecreaseOrder = ({
  order: orderData,
  position: positionForOrder,
}: ValidateDecreaseOrderProps): ValidateOrderResult => {
  if (!positionForOrder) {
    return { type: ValidateOrderResultType.noPositionOpened };
  }

  if (positionForOrder.size.lt(orderData.sizeDelta)) {
    return { type: ValidateOrderResultType.orderSizeExceedsPositionSize };
  }

  if (
    positionForOrder.collateral.lt(orderData.collateralDelta) ||
    positionForOrder.collateral
      .sub(orderData.collateralDelta)
      .lt(MIN_COLLATERAL)
  ) {
    return {
      type: ValidateOrderResultType.leftoverCollateralLowerThanMin,
      minCollateral: {
        amount: MIN_COLLATERAL,
        decimals: USD_DECIMALS,
      },
    };
  }

  if (positionForOrder.size.gt(orderData.sizeDelta)) {
    if (
      positionForOrder.size
        .sub(orderData.sizeDelta)
        .lt(positionForOrder.collateral.sub(orderData.collateralDelta))
    ) {
      return {
        type: ValidateOrderResultType.wouldReduceLeverageBelowOne,
      };
    }

    if (positionForOrder.size.sub(orderData.sizeDelta).lt(MIN_POSITION_USD)) {
      return {
        type: ValidateOrderResultType.leftoverSizeLowerThanMin,
        minPositionSize: {
          amount: MIN_POSITION_USD,
          decimals: USD_DECIMALS,
        },
      };
    }
  }

  return {
    type: ValidateOrderResultType.isValid,
  };
};
