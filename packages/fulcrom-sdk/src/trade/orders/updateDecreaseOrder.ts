import { getContractAddress } from "../../config";
import { UpdateOrderRequest } from "../../types";

import { getPosition } from "../../positions/getPosition";
import { getDecreaseOrdersMatchId } from "../../orders/getOrders";
import { buildUpdateDecreaseOrderParams } from "./order/updateDecreaseOrderParams";
import { generateUpdateDecreaseOrderTxData } from "./order/generateUpdateDecreaseOrderTxData";
import { DecreaseOrder } from "../../query/graphql";

/**
 * updat decrease order
 */
export async function executeUpdateDecreaseOrder(
  request: UpdateOrderRequest,
  caches: Map<string, any>
) {
  // firstly to get order
  if (request.order.type == "DecreaseOrder") {
    const eligibleOrder = await getDecreaseOrdersMatchId(
      request.account,
      request.chainId,
      request.order.id,
      caches
    );
    if (eligibleOrder && eligibleOrder.length > 0) {
      // second to get position
      const existingPosition = await getPosition({
        account: request.account,
        toToken: eligibleOrder[0].indexToken,
        chainId: request.chainId,
        isLong: eligibleOrder[0].isLong,
        collateralTokenAddress: eligibleOrder[0].collateralToken,
        caches,
      });
      if (existingPosition) {
        // third to build updateDecreaseOrderParams
        if (request.order.type == "DecreaseOrder") {
          const updaetDecreaseOrderParams =
            await buildUpdateDecreaseOrderParams(
              existingPosition,
              eligibleOrder as DecreaseOrder[],
              request.chainId,
              false,
              request.transactionAmount,
              request.triggerExecutionPrice,
              true,
              caches
            );

          const txData = await generateUpdateDecreaseOrderTxData({
            account: request.account,
            chainId: request.chainId,
            plugin: getContractAddress("OrderBook", request.chainId),
            contractParams: updaetDecreaseOrderParams,
          });

          return {
            statusCode: 200,
            message: ["update decrease order success"],
            txData: [txData],
          };
        }
      } else {
        return {
          statusCode: 400,
          message: ["error: cannot find position info"],
        };
      }
    }
  } else {
    return {
      statusCode: 400,
      message: ["error: cannot find order info"],
    };
  }
}
