import { BASIS_POINTS_DIVISOR } from "../../../../config";
import { ZERO_BIG_INT } from "../../../../config/zero";
import { getOrderErrorFromValidationResult } from "../../../../orders/getOrderErrorFromValidationResult";
import { validateIncreaseOrder } from "../../../../orders/validateOrder";
import { IncreaseOrder } from "../../../../query/graphql";
import { getUserMaxLeverage } from "../../../../utils/insaneMode/getUserMaxLeverage";
import { getLeverages } from "../utils/getLeverages";
import { ValidationUpdateOrderParams } from "./checkIsEligibleToUpdateOrderOrder";

export const validateSizeDelta = async (
  params: Omit<ValidationUpdateOrderParams, "order"> & {
    order: IncreaseOrder;
  }
) => {
  const errorMsg: string[] = [];

  const leverages = await getLeverages({
    chainId: params.chainId,
    order: params.order,
    position: params.position,
    purchaseTokenInfo: params.purchaseTokenInfo,
    transactionAmount: params.transactionAmount,
    indexTokenInfo: params.indexTokenInfo,
    collateralTokenInfo: params.collateralTokenInfo,
    caches: params.caches,
  });

  const userMaxLeverage = await getUserMaxLeverage({
    chainId: params.chainId,
    account: params.account,
  });
  const maxLeverage = userMaxLeverage * BASIS_POINTS_DIVISOR;

  if (
    leverages.next > maxLeverage || // leverage cant be larger than max leverage
    leverages.next <= ZERO_BIG_INT //FIXME: the estimate leverage function will yield negative number if sizeDelta exceed a certain amount
  ) {
    errorMsg.push(`Exceeded the max allowed leverage ${userMaxLeverage}x`);
  }

  const validation = validateIncreaseOrder({
    nextLeverage: leverages.next,
    position: params.position,
  });

  const error = getOrderErrorFromValidationResult({ result: validation });

  if (error) {
    errorMsg.push(error);
  }

  return errorMsg;
};
