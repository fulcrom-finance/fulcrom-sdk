import { USD_DECIMALS } from "../../../config";
import { ChainId, TokenInfo } from "../../../types";
import { Position } from "../../../types/position";
import { parseValue } from "../../../utils/numbers/parseValue";
import { OrderType } from "../../orders/types/orderType";
import { getEntryPrice } from "../../utils/entryPrice";
import { getNextAveragePrice } from "./getNextAveragePrice";

export const getNextEntryPrice = async (params: {
  chainId: ChainId;
  fromToken: TokenInfo;
  transactionAmount: string;
  toToken: TokenInfo;
  orderType: OrderType;
  isLongPosition: boolean;
  collateralTokenInfo: TokenInfo;
  leverageRatio?: number;
  triggerExecutionPrice?: string;
  existingPosition?: Position;
  caches: Map<string, any>;
}) => {
  const entryPrice = getEntryPrice(
    params.toToken,
    parseValue(params.triggerExecutionPrice ?? "0", USD_DECIMALS),
    params.orderType,
    params.isLongPosition
  );
  const nextEntryPrice = await getNextAveragePrice({
    chainId: params.chainId,
    existingPosition: params.existingPosition,
    fromTokenInfo: params.fromToken,
    fromAmount: parseValue(params.transactionAmount, params.fromToken.decimals),
    toTokenInfo: params.toToken,
    triggerExecutionPrice: params.triggerExecutionPrice,
    orderType: params.orderType,
    isLong: params.isLongPosition,
    caches: params.caches,
    collateralTokenInfo: params.collateralTokenInfo,
    leverage: params.leverageRatio,
  }); // existing position change
  const hasExistingPosition = !!params.existingPosition;
  const isShowNextAmount = hasExistingPosition;
  if (isShowNextAmount) {
    return nextEntryPrice;
  } else {
    return entryPrice;
  }
};
