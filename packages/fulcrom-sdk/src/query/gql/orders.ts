import { Address } from "../../types";

export type GetOrdersQueryOpts = {
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  account: Address;
};
export const getOrdersQuery = (opts: GetOrdersQueryOpts) => {
  const lowerCaseAccount = opts.account.toLowerCase();
  const { orderBy = "timestamp", orderDirection = "asc" } = opts || {};

  return `
    increaseOrders(
      where: {account: "${lowerCaseAccount}"}, 
      orderBy: ${orderBy},
      orderDirection: ${orderDirection}
    ) {
      id
      account
      index
      purchaseToken
      purchaseTokenAmount
      collateralToken
      indexToken
      sizeDelta
      isLong
      triggerPrice
      triggerAboveThreshold
      executionFee
      timestamp
      tp
      sl
      tpSlExecutionFee
    }
    decreaseOrders(
      where: {account: "${lowerCaseAccount}"},
      orderBy: ${orderBy},
      orderDirection: ${orderDirection}
    ) {
      id
      account
      index
      collateralToken
      collateralDelta
      indexToken
      sizeDelta
      isLong
      triggerPrice
      triggerAboveThreshold
      executionFee
      timestamp
    }
    swapOrders(
      where: {account: "${lowerCaseAccount}"},
      orderBy: ${orderBy},
      orderDirection: ${orderDirection}
    ) {
      id
      account
      index
      path
      amountIn
      minOut
      triggerRatio
      triggerAboveThreshold
      shouldUnwrap
      executionFee
      timestamp
    }
  `;
};
