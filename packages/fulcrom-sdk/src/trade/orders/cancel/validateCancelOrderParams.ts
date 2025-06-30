import { validateChainIdAndAccount } from "../../../positions/validateChainIdAndAccount";
import { CancelOrdersRequest } from "../../../types";

export const validateCancelOrderParams = (params: CancelOrdersRequest) => {
  const errorMsg: string[] = [];
  const errors = validateChainIdAndAccount(params.account, params.chainId);
  errorMsg.push(...errors);
  // Validate orders
  if (!Array.isArray(params.orders) || params.orders.length === 0) {
    errorMsg.push("Orders must be a non-empty array.");
  } else {
    params.orders.forEach((order, index) => {
      if (
        !order.type ||
        (order.type !== "DecreaseOrder" && order.type !== "IncreaseOrder")
      ) {
        errorMsg.push(
          `Order at index ${index} is missing a valid type (DecreaseOrder or IncreaseOrder).`
        );
      }
      if (!order.id || typeof order.id !== "string") {
        errorMsg.push(`Order at index ${index} is missing a valid id.`);
      }
    });
  }

  return errorMsg;
};
