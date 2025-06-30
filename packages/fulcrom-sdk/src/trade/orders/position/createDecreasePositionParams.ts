import { BigNumber } from "@ethersproject/bignumber";
import { OrderType } from "../types/orderType";
import { AddressZero } from "@ethersproject/constants";

import {
  getTokenByAddressSafe,
  getTokenBySymbol,
  TokenSymbol,
} from "../../../config";
import { getCreateDecreasePositionPath } from "../../utils/path";
import { BIG_NUM_ZERO } from "../../../config/zero";
import { getIsNative } from "../../../utils/nativeTokens/getNativeTokensInfo";
import { getDecreasePositionPriceLimit } from "../../utils/priceLimit";
import { ChainId, TokenInfo } from "../../../types";
import { getPriceUpdateData } from "../../utils/priceUpdateData";
import { getPythUpdateFee } from "../../utils/pythUpdateFee";
import { Position } from "../../../types/position";
import { DecreaseOrder } from "../../../query/graphql";
import { getPositionMinExecutionFee } from "../../utils/minExecutionFee";
import { getSizeDelta } from "../../../positions/utils/getSizeDelta";
import { getCollateralDelta } from "../../../positions/utils/getCollateralDelta";

export const defaultReceiveTokenSymbol = (
  chainId: ChainId,
  isMarket: boolean,
  collateralTokenAddress: string,
  receiveTokenSymbol?: string
) => {
  if (isMarket && receiveTokenSymbol === undefined) {
    const token = getTokenByAddressSafe(collateralTokenAddress, chainId);
    if (!token) {
      throw new Error(
        `invalid  collateral token address ${collateralTokenAddress} at chain ${chainId}`
      );
    }
    return token.symbol;
  }
  return receiveTokenSymbol;
};

export async function buildCreateDeCreasePositionParams(
  position: Position,
  decreaseOrder: DecreaseOrder[],
  chainId: ChainId,
  account: string,
  isMarket: boolean,
  allowedSlippageAmount: number,
  decreaseAmount: string,
  triggerPrice: string,
  isKeepLeverage: boolean,
  caches: Map<string, any>,
  receiveTokenSymbol?: string
): Promise<ContractDecreasePositionParams> {
  const receiveToken = getTokenBySymbol(
    receiveTokenSymbol as TokenSymbol,
    chainId
  );
  const path = getCreateDecreasePositionPath(
    position.collateralToken,
    receiveToken.address
  );

  const isNative = getIsNative(receiveTokenSymbol as TokenSymbol, chainId);
  const executionFee = await getPositionMinExecutionFee(chainId);
  const priceLimit = getDecreasePositionPriceLimit(
    position,
    isMarket,
    allowedSlippageAmount,
    triggerPrice
  );

  const priceUpdateData = await getPriceUpdateData(
    chainId,
    position.indexToken,
    false,
    path
  );
  const pythUpdateFee = await getPythUpdateFee(chainId, priceUpdateData ?? []);
  // decreaseOrder need pass
  const sizeDelta = getSizeDelta(
    position,
    decreaseOrder,
    isMarket,
    decreaseAmount,
    triggerPrice
  );

  const collateralDelta = await getCollateralDelta({
    position,
    isMarket,
    decreaseAmount,
    triggerPrice,
    sizeDelta,
    chainId,
    isKeepLeverage,
    caches,
  });

  const ethValue = executionFee?.add(pythUpdateFee || 0);

  const params = {
    path: path,
    indexToken: position.indexToken,
    collateralDelta: collateralDelta,
    sizeDelta: sizeDelta,
    isLong: position.isLong,
    receiver: account,
    acceptablePrice: priceLimit,
    minOut: BIG_NUM_ZERO,
    executionFee: executionFee ?? BIG_NUM_ZERO,
    withdrawETH: isNative,
    callbackTarget: AddressZero,
    priceData: pythUpdateFee ? priceUpdateData ?? [] : [],
  };

  return {
    params: params,
    override: { value: ethValue.toString() },
  };
}

//  needed params to build params for contract
export type CreateDecreasePositionParams = {
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
  takeProfitPrice?: BigNumber;
  stopLossPrice?: BigNumber;
};

// pass first parameters to contract
export type DecreasePositionParamsStruct = {
  path: string[];
  indexToken: string;
  collateralDelta: BigNumber;
  sizeDelta: BigNumber;
  isLong: boolean;
  receiver: string;
  acceptablePrice: BigNumber;
  minOut: BigNumber;
  executionFee: BigNumber;
  withdrawETH: boolean;
  callbackTarget: string;
  priceData: string[];
};

// pass params to contract as first parameter and override as second parameter
export type ContractDecreasePositionParams = {
  params: DecreasePositionParamsStruct;
  override?: { value: string };
};
