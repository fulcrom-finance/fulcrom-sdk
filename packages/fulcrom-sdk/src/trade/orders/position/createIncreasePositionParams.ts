import { BigNumber } from "@ethersproject/bignumber";
import { OrderType } from "../types/orderType";
import { AddressZero, HashZero } from "@ethersproject/constants";

import { TokenSymbol } from "../../../config";
import { getCreateIncreasePositionPath } from "../../utils/path";
import { BIG_NUM_ZERO } from "../../../config/zero";
import { getToUsdMax } from "../../utils/toValue";
import { getPositionFinalExecutionFee } from "../../utils/positionFinalExecutionFee";
import { getIsNative } from "../../../utils/nativeTokens/getNativeTokensInfo";
import { getIncreasePositionPriceLimit } from "../../utils/priceLimit";
import { ChainId, TokenInfo } from "../../../types";
import { getPriceUpdateData } from "../../utils/priceUpdateData";
import { getPythUpdateFee } from "../../utils/pythUpdateFee";
import { getCreateIncreasePositionFee } from "../../utils/createIncreasePositionFee";
import { parseValue } from "../../../utils/numbers/parseValue";

export async function buildCreateInCreasePositionParams(
  request: CreateIncreasePositionParams
): Promise<ContractIncreasePositionParams> {
  const path = getCreateIncreasePositionPath(
    request.fromTokenInfo.address,
    request.toTokenInfo.address,
    request.collateralTokenInfo.address,
    !request.isLong
  );
  const indexToken = request.toTokenInfo.address;
  const fromAmount = parseValue(
    request.fromAmount,
    request.fromTokenInfo.decimals
  );

  const isTakeProfitPriceEnabled =
    request.takeProfitPrice != null && request.takeProfitPrice.gt(0);
  const isStopLossPriceEnabled =
    request.stopLossPrice != null && request.stopLossPrice.gt(0);
    
  const executionFee = await getPositionFinalExecutionFee(
    request.chainId,
    isStopLossPriceEnabled,
    isTakeProfitPriceEnabled,
    request.caches
  );

  const tpPrice = isTakeProfitPriceEnabled
    ? request.takeProfitPrice ?? BIG_NUM_ZERO
    : BIG_NUM_ZERO;
  const slPrice = isStopLossPriceEnabled
    ? request.stopLossPrice ?? BIG_NUM_ZERO
    : BIG_NUM_ZERO;

  const isNative = getIsNative(
    request.fromTokenInfo.symbol as TokenSymbol,
    request.chainId
  );
  const acceptablePrice = getIncreasePositionPriceLimit(
    request.toTokenInfo,
    request.allowedSlippageAmount,
    request.isLong
  );

  const sizeDelta = await getToUsdMax(
    request.chainId,
    request.fromTokenInfo,
    fromAmount,
    request.toTokenInfo,
    BIG_NUM_ZERO,
    request.orderType,
    request.isLong,
    request.collateralTokenInfo,
    request.caches,
    undefined,
    request.leverageRatio
  );

  const priceUpdateData = await getPriceUpdateData(
    request.chainId,
    request.toTokenInfo.address,
    false,
    path
  );
  const pythUpdateFee = await getPythUpdateFee(
    request.chainId,
    priceUpdateData ?? []
  );

  const ethValue = await getCreateIncreasePositionFee(
    fromAmount,
    pythUpdateFee ?? BigNumber.from(0),
    executionFee,
    isNative
  );

  const params = {
    amountIn: fromAmount,
    indexToken: indexToken,
    sizeDelta: sizeDelta,
    isLong: request.isLong,
    acceptablePrice: acceptablePrice,
    hasCollateralInETH: isNative,
    path: path,
    priceData: pythUpdateFee ? priceUpdateData ?? [] : [],
    executionFee: executionFee,
    tp: tpPrice,
    sl: slPrice,
    minOut: BigNumber.from(0),
    referralCode: HashZero,
    callbackTarget: AddressZero,
    brokerFeeBasisPoints: BIG_NUM_ZERO,
    brokerAddress: AddressZero,
  };

  return {
    params: params,
    override: { value: ethValue.toString() },
  };
}

//  needed params to build params for contract
export type CreateIncreasePositionParams = {
  chainId: ChainId;
  account: string;
  fromTokenInfo: TokenInfo;
  fromAmount: string;
  toTokenInfo: TokenInfo;
  isLong: boolean;
  collateralTokenInfo: TokenInfo;
  orderType: OrderType;
  leverageRatio: number;
  allowedSlippageAmount: number;
  caches: Map<string, any>;
  takeProfitPrice?: BigNumber;
  stopLossPrice?: BigNumber;
};

// pass first parameters to contract
export type IncreasePositionParamsV2Struct = {
  amountIn: BigNumber;
  minOut: BigNumber;
  sizeDelta: BigNumber;
  acceptablePrice: BigNumber;
  executionFee: BigNumber;
  referralCode: string;
  callbackTarget: string; // it's not exist in contract
  tp: BigNumber;
  sl: BigNumber;
  brokerFeeBasisPoints: BigNumber;
  indexToken: string;
  brokerAddress: string;
  isLong: boolean;
  hasCollateralInETH: boolean;
  path: string[];
  priceData: string[];
};

// pass params to contract as first parameter and override as second parameter
export type ContractIncreasePositionParams = {
  params: IncreasePositionParamsV2Struct;
  override?: { value: string };
};
