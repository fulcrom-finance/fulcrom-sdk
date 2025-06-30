import { ChainId } from "../../../types";
import { getIsNative } from "../../../utils/nativeTokens";
import { getOrderFinalExecutionFee } from "../../utils/orderFinalExecutionFee";
import { isStopMarket, OrderType } from "../types/orderType";
import { BigNumber } from "@ethersproject/bignumber";
import { TokenInfo } from "../../../types";
import { getToUsdMax } from "../../utils/toValue";
import { expandDecimals } from "../../../config";

export type CreateIncreaseOrderParams = {
  // validation
  chainId: ChainId;
  account: string;
  // order create
  fromTokenInfo: TokenInfo;
  fromAmount: BigNumber;
  toTokenInfo: TokenInfo;
  isLong: boolean;
  collateralTokenInfo: TokenInfo;
  orderType: OrderType;
  // if StopMarket/LimitOrder
  triggerPrice: BigNumber;
  takeProfitPrice: BigNumber;
  stopLossPrice: BigNumber;
  caches: Map<string, any>;
  leverageRatio?: number;
  // precision?: number;
};

export type ContractIncreaseOrderParamsStruct = {
  path: string[];
  amountIn: BigNumber;
  indexToken: string;
  minOut: number;
  sizeDelta: BigNumber;
  collateralToken: string;
  isLong: boolean;
  triggerPrice: BigNumber;
  triggerAboveThreshold: boolean;
  executionFee: BigNumber;
  shouldWrap: boolean;
  tp: BigNumber;
  sl: BigNumber;
};

export type ContractIncreaseOrderV2Params = {
  params: ContractIncreaseOrderParamsStruct;
  override?: { value: string };
};

export async function buildContractParamsForIncreaseOrder(
  params: CreateIncreaseOrderParams
): Promise<ContractIncreaseOrderV2Params> {
  const path = [params.fromTokenInfo.address];
  const amountIn = params.fromAmount;
  const indexToken = params.toTokenInfo.address;
  const minOut = 0;
  const precision = 8;
  
  const sizeDelta = (
    await getToUsdMax(
      params.chainId,
      params.fromTokenInfo,
      params.fromAmount,
      params.toTokenInfo,
      params.triggerPrice,
      params.orderType,
      params.isLong,
      params.collateralTokenInfo,
      params.caches,
      precision,
      params.leverageRatio
    )
  ).div(expandDecimals(precision));

  const collateralTokenAddress = params.isLong
    ? params.toTokenInfo.address
    : params.collateralTokenInfo.address; //TODO    collateralToken? collateralToken: getTokenBySymbol('USDC', dataChainId)
  const isLong = params.isLong;
  const triggerPrice = params.triggerPrice;
  const triggerAboveThreshold = isStopMarket(params.orderType)
    ? isLong
    : !isLong; // for stop market, triggerAboveThreshold is the same as isLong; for limit order, just opposite
  const executionFee = await getOrderFinalExecutionFee(
    params.chainId,
    params.stopLossPrice != null && params.stopLossPrice.gt(0),
    params.takeProfitPrice != null && params.takeProfitPrice.gt(0),
    params.caches
  );
  const shouldWrap = getIsNative(params.fromTokenInfo.symbol, params.chainId);
  const tp = params.takeProfitPrice;
  const sl = params.stopLossPrice;

  return {
    params: {
      path,
      amountIn,
      indexToken,
      minOut,
      sizeDelta,
      collateralToken: collateralTokenAddress,
      isLong,
      triggerPrice,
      triggerAboveThreshold,
      executionFee,
      shouldWrap,
      tp,
      sl,
    },
    override: {
      value: shouldWrap
        ? executionFee.add(params.fromAmount).toString()
        : executionFee.toString(),
    },
  };
}
