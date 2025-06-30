import { getContractAddress } from "../../config";
import { UpdateOrderRequest } from "../../types";

import { getIncreaseOrdersMatchId } from "../../orders/getOrders";
import { IncreaseOrder } from "../../query/graphql";
import { buildUpdateIncreaseOrderParams } from "./order/updateIncreaseOrderParams";
import { generateUpdateIncreaseOrderTxData } from "./order/generateUpdateIncreaseOrderTxData";

/**
 * update increase order
 */
export async function executeUpdateIncreaseOrder(
  request: UpdateOrderRequest,
  caches: Map<string, any>
) {
  // firstly to get order
  if (request.order.type == "IncreaseOrder") {
    const eligibleOrder = await getIncreaseOrdersMatchId(
      request.account,
      request.chainId,
      request.order.id,
      caches
    );
    if (eligibleOrder && eligibleOrder.length > 0) {
      //  build updateIncreaseOrderParams
      const updaetIncreaseOrderParams = await buildUpdateIncreaseOrderParams(
        request,
        eligibleOrder as IncreaseOrder[]
      );

      const txData = await generateUpdateIncreaseOrderTxData({
        account: request.account,
        chainId: request.chainId,
        plugin: getContractAddress("OrderBook", request.chainId),
        contractParams: updaetIncreaseOrderParams,
      });

      return {
        statusCode: 200,
        message: ["update increase order success"],
        txData: [txData],
      };
    } else {
      return {
        statusCode: 400,
        message: ["error: cannot find order info"],
      };
    }
  } else {
    return {
      statusCode: 400,
      message: ["error: the order type is not correct"],
    };
  }
}
