import { getContractAddress } from "../../../config";
import { Order } from "../../../query/graphql";
import { CancelOrdersRequest } from "../../../types";
import { generateCancelOrdersTxData } from "./generateCancelOrdersTxData";

export const executeCancelOrder = async (
  request: CancelOrdersRequest,
  cancelOrders: Order[]
) => {
  return generateCancelOrdersTxData({
    account: request.account,
    chainId: request.chainId,
    plugin: getContractAddress("OrderBook", request.chainId),
    orders: cancelOrders,
  });
};
