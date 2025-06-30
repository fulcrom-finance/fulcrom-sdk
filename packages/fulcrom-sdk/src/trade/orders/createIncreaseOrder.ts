import { BigNumber } from "@ethersproject/bignumber";
import {
  getContractAddress,
  TokenSymbol,
  USD_DECIMALS,
  DEFAULT_LEVERAGE,
  DEFAULT_SLIPPAGE_BASIS_POINTS,
} from "../../config";
import { CreateIncreaseOrderRequest, TokenInfo } from "../../types";
import { parseValue } from "../../utils/numbers/parseValue";
import { isStopOrLimitOrder } from "./types/orderType";
import { buildContractParamsForIncreaseOrder } from "./order/createIncreaseOrderParams";
import { generateCreateIncreaseOrderTxData } from "./order/generateCreateIncreaseOrderTxData";
import { buildCreateInCreasePositionParams } from "./position/createIncreasePositionParams";
import { generateCreateIncreasePositionTxData } from "./position/generateCreateIncreasePositionTxData";
import { BIG_NUM_ZERO } from "../../config/zero";
import { TokenManager } from "../../utils/tokenManager";

/**
 * Fetch token information and validate symbols
 */
export async function getAndValidateTokenInfo(
  chainId: number,
  isLongPosition: boolean,
  symbols: { source: string; target: string; collateral?: string },
  tokenManager: TokenManager
) {
  const fromTokenInfo = tokenManager.getTokenBySymbol(
    symbols.source as TokenSymbol,
    chainId
  );
  const toTokenInfo = tokenManager.getTokenBySymbol(
    symbols.target as TokenSymbol,
    chainId
  );
  const collateralTokenInfo = isLongPosition
    ? toTokenInfo
    : symbols.collateral
    ? tokenManager.getTokenBySymbol(symbols.collateral as TokenSymbol, chainId)
    : tokenManager.getTokenBySymbol("USDC", chainId);
  if (!fromTokenInfo || !toTokenInfo || !collateralTokenInfo) {
    throw new Error(
      "Failed to get token information. Ensure all token symbols are valid and token info is loaded."
    );
  }
  return { fromTokenInfo, toTokenInfo, collateralTokenInfo };
}

/**
 * Parse and validate prices
 */
function parsePrices(
  request: CreateIncreaseOrderRequest,
  fromTokenDecimals: number
) {
  return {
    takeProfit: request.takeProfitTargetPrice
      ? parseValue(request.takeProfitTargetPrice, USD_DECIMALS)
      : BIG_NUM_ZERO,
    stopLoss: request.stopLossTriggerPrice
      ? parseValue(request.stopLossTriggerPrice, USD_DECIMALS)
      : BIG_NUM_ZERO,
    trigger: request.triggerExecutionPrice
      ? parseValue(request.triggerExecutionPrice, USD_DECIMALS)
      : BIG_NUM_ZERO,
    transaction: parseValue(request.transactionAmount, fromTokenDecimals),
  };
}

/**
 * Create an increase order
 */
export async function executeIncreaseOrder(
  request: CreateIncreaseOrderRequest,
  fromTokenInfo: TokenInfo,
  toTokenInfo: TokenInfo,
  collateralTokenInfo: TokenInfo,
  caches: Map<string, any>
) {
  // Parse and validate prices
  const parsedPrices = parsePrices(request, fromTokenInfo.decimals);

  // Handle StopMarket/LimitOrder
  if (isStopOrLimitOrder(request.orderType)) {
    const params = {
      chainId: request.chainId,
      account: request.account,
      orderType: request.orderType,
      isLong: request.isLongPosition,
      leverageRatio: request.leverageRatio ?? DEFAULT_LEVERAGE,
      fromTokenInfo,
      toTokenInfo,
      collateralTokenInfo,
      fromAmount: parsedPrices.transaction,
      triggerPrice: parsedPrices.trigger,
      takeProfitPrice: parsedPrices.takeProfit,
      stopLossPrice: parsedPrices.stopLoss,
      caches,
    };

    const increaseOrderContractParams =
      await buildContractParamsForIncreaseOrder(params);
    const txData = await generateCreateIncreaseOrderTxData({
      account: request.account,
      chainId: request.chainId,
      plugin: getContractAddress("OrderBook", request.chainId),
      contractParams: increaseOrderContractParams,
    });

    return {
      statusCode: 200,
      message: "create increase order success",
      txData: [txData],
    };
  } else {
    // Handle regular position creation
    const params = {
      chainId: request.chainId,
      account: request.account,
      fromTokenInfo,
      fromAmount: request.transactionAmount,
      toTokenInfo,
      isLong: request.isLongPosition,
      collateralTokenInfo,
      orderType: request.orderType,
      leverageRatio: request.leverageRatio ?? DEFAULT_LEVERAGE,
      allowedSlippageAmount:
        request.allowedSlippageAmount ?? DEFAULT_SLIPPAGE_BASIS_POINTS,
      takeProfitPrice: parsedPrices.takeProfit,
      stopLossPrice: parsedPrices.stopLoss,
      caches,
    };

    const increasePositionParams = await buildCreateInCreasePositionParams(
      params
    );
    const txData = await generateCreateIncreasePositionTxData({
      account: request.account,
      chainId: request.chainId,
      plugin: getContractAddress("PositionRouter", request.chainId),
      contractParams: increasePositionParams,
    });

    return {
      statusCode: 200,
      message: "create increase position success",
      txData: [txData],
    };
  }
}
