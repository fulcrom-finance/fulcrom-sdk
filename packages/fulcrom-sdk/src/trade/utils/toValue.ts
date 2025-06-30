import { BigNumber } from "@ethersproject/bignumber";
import { BIG_NUM_ZERO } from "../../config/zero";
import { expandDecimals } from "../../utils/numbers/expandDecimals";

import { getNextToAmount } from "./nextToAmount";
import { isStopOrLimitOrder, OrderType } from "../orders/types/orderType";
import { ChainId, Token } from "../../types";
import { TokenInfo } from "../../types";

/**
 * this store seems useless as used only once and all it eventually does is parse the string value back to bignum
 * it also lead to precision lose, at useToAmount
 * @example
 * when useNextToAmount() => 267414733
 * at useToValue.setToValue, the toValue is from formatAmount(useNextToAmount()), precision lost
 * at useToAmount, it parse back to BigNumber by parseValue(toValue) => 267410000
 */
/*
export type ToValueState = {
  toValue: string;
  setToValue: (value: string) => void;
};
export const useToValue = create<ToValueState>()((set) => ({
  toValue: '',
  setToValue: (toValue: string) => {
    set({ toValue });
  },
}));

export const useToAmount = (): BigNumber => {
  const toValue = useToValue((s) => s.toValue);
  const toToken = useToToken((s) => s.useToToken)();

  return parseValue(toValue, toToken.decimals);
};

export const useMinOut = (): BigNumber => {
  const toAmount = useToAmount();
  const allowedSlippage = useAllowedSlippage((s) => s.useAllowedSlippage());

  const minOut = toAmount
    .mul(BASIS_POINTS_DIVISOR - allowedSlippage)
    .div(BASIS_POINTS_DIVISOR);

  return minOut;
};*/

export const getToUsdMax = async (
  chainId: ChainId,
  fromTokenInfo: TokenInfo,
  transactionAmount: BigNumber,
  toTokenInfo: TokenInfo,
  triggerPrice: BigNumber,
  orderType: OrderType,
  isLong: boolean,
  shortCollateralTokenInfo: TokenInfo,
  caches: Map<string, any>,
  precision?: number,
  leverageRatio?: number
): Promise<BigNumber> => {
  const toAmount =
    (await getNextToAmount(
      chainId,
      fromTokenInfo,
      transactionAmount,
      toTokenInfo,
      triggerPrice,
      orderType,
      isLong,
      shortCollateralTokenInfo,
      caches,
      leverageRatio,
      precision
    )) || BIG_NUM_ZERO;

  if (isStopOrLimitOrder(orderType) && triggerPrice.gt(0)) {
    return toAmount.mul(triggerPrice).div(expandDecimals(toTokenInfo.decimals));
  }
  if (!toTokenInfo.maxPrice) return BigNumber.from(0);

  return toAmount
    .mul(toTokenInfo.maxPrice)
    .div(expandDecimals(toTokenInfo.decimals));
};
