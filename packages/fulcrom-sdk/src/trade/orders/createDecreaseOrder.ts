import {
  DEFAULT_SLIPPAGE_BASIS_POINTS,
  getContractAddress,
} from "../../config";
import { CreateDecreaseRequest, TokenInfo } from "../../types";
import {
  buildCreateDeCreasePositionParams,
  defaultReceiveTokenSymbol,
} from "./position/createDecreasePositionParams";
import { getPosition } from "../../positions/getPosition";
import { generateCreateDecreasePositionTxData } from "./position/generateCreateDecreasePositionTxData";
import { getDecreaseOrders } from "../../orders/getOrders";
import { BIG_NUM_ZERO } from "../../config/zero";
import { buildCreateDecreaseOrderParams } from "./order/createDecreaseOrderParams";
import { generateCreateDecreaseOrderTxData } from "./order/generateCreateDecreaseOrderTxData";

/**
 * Create an decrease order
 */
export async function executeDecreaseOrder(
  request: CreateDecreaseRequest,
  toTokenInfo: TokenInfo,
  collateralTokenInfo: TokenInfo,
  caches: Map<string, any>
) {
  const existingPosition = await getPosition({
    account: request.account,
    toToken: toTokenInfo.address,
    chainId: request.chainId,
    isLong: request.isLongPosition,
    collateralTokenAddress: collateralTokenInfo?.address,
    caches,
  });

  if (existingPosition) {
    const decreaseOrders = await getDecreaseOrders(
      request.chainId,
      request.account,
      caches
    );

    const receiveTokenSymbol = defaultReceiveTokenSymbol(
      request.chainId,
      request.isMarket,
      existingPosition.collateralToken,
      request.receiveTokenSymbol
    );

    if (request.isMarket) {
      const decreasePositionParams = await buildCreateDeCreasePositionParams(
        existingPosition,
        decreaseOrders,
        request.chainId,
        request.account,
        request.isMarket,
        request.allowedSlippageAmount ?? DEFAULT_SLIPPAGE_BASIS_POINTS,
        request.decreaseAmount,
        (request.triggerExecutionPrice ?? BIG_NUM_ZERO).toString(),
        request.isKeepLeverage,
        caches,
        receiveTokenSymbol
      );

      const txData = await generateCreateDecreasePositionTxData({
        account: request.account,
        chainId: request.chainId,
        plugin: getContractAddress("PositionRouter", request.chainId),
        contractParams: decreasePositionParams,
      });

      return {
        statusCode: 200,
        message: ["create decrease position success"],
        txData: [txData],
      };
    } else {
      const decreaseOrderParams = await buildCreateDecreaseOrderParams(
        existingPosition,
        decreaseOrders,
        request.chainId,
        request.isMarket,
        request.decreaseAmount,
        (request.triggerExecutionPrice ?? BIG_NUM_ZERO).toString(),
        request.isKeepLeverage,
        caches
      );

      const txData = await generateCreateDecreaseOrderTxData({
        account: request.account,
        chainId: request.chainId,
        plugin: getContractAddress("OrderBook", request.chainId),
        contractParams: decreaseOrderParams,
      });

      return {
        statusCode: 200,
        message: ["create decrease order success"],
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
