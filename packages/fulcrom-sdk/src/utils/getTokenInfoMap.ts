import { ChainId, PriceCandle, Token, TokenInfo, TokenInfoMap } from "../types";
import { BigNumber } from "@ethersproject/bignumber";
import {
  expandDecimals,
  getDefaultTokenInfoMap,
  USD_DECIMALS,
} from "../config";
import { getTokenPriceDecimals } from "./getTokenPriceDecimals";
import { parseValue } from "./numbers/parseValue";

export const getInfoTokenMap = (options: {
  tokens: Token[];
  balances?: BigNumber[];
  vaultTokenInfo?: BigNumber[];
  tokensPriceData: Record<string, PriceCandle[]>;
  chainId: ChainId;
}): TokenInfoMap => {
  const vaultPropsLength = 15;

  const { tokens, balances, vaultTokenInfo, tokensPriceData, chainId } =
    options;

  const tokenInfoMap = getDefaultTokenInfoMap(chainId);

  // failed to load token info , returns the default tokenInfo data
  if (!vaultTokenInfo) return tokenInfoMap;

  for (let i = 0; i < tokens.length; i++) {
    const token = {
      ...tokenInfoMap[tokens[i].address],
      ...tokens[i],
    } as TokenInfo;

    if (balances?.[i]) {
      token.balance = balances[i];
    }

    if (vaultTokenInfo) {
      // poolAmounts tracks the number of received tokens that can be used for leverage
      // this is tracked separately from tokenBalances to exclude funds that are deposited as margin collateral
      token.poolAmount = vaultTokenInfo[i * vaultPropsLength];
      // reservedAmounts tracks the number of tokens reserved for open leverage positions
      token.reservedAmount = vaultTokenInfo[i * vaultPropsLength + 1];
      token.availableAmount = token.poolAmount.sub(token.reservedAmount);
      // usdgAmounts tracks the amount of USDG debt for each whitelisted token
      // usdgAmount ~= poolAmount * price
      token.usdgAmount = vaultTokenInfo[i * vaultPropsLength + 2];
      // redemptionAmount is deprecated
      token.redemptionAmount = vaultTokenInfo[i * vaultPropsLength + 3];
      token.weight = vaultTokenInfo[i * vaultPropsLength + 4];
      // bufferAmounts allows specification of an amount to exclude from swaps
      // this can be used to ensure a certain amount of liquidity is available for leverage positions
      token.bufferAmount = vaultTokenInfo[i * vaultPropsLength + 5];
      // maxUsdgAmounts allows setting a max amount of USDG debt for a token
      token.maxUsdgAmount = vaultTokenInfo[i * vaultPropsLength + 6];
      // it only meaningful for non-stable coins
      token.globalShortSize = vaultTokenInfo[i * vaultPropsLength + 7];
      token.maxGlobalShortSize = vaultTokenInfo[i * vaultPropsLength + 8];
      token.maxGlobalLongSize = vaultTokenInfo[i * vaultPropsLength + 9];

      // token Prices
      const contractMinPrice = vaultTokenInfo[i * vaultPropsLength + 10];
      const contractMaxPrice = vaultTokenInfo[i * vaultPropsLength + 11];
      const tokenPrices = tokensPriceData[token.symbol];
      if (
        tokenPrices &&
        tokenPrices.length > 0 &&
        contractMaxPrice.eq(contractMinPrice ?? 0)
      ) {
        const latestPrices = tokenPrices[tokenPrices?.length - 1];
        const latestPrice = latestPrices?.close;
        if (latestPrice) {
          token.minPrice = parseValue(
            latestPrice.toFixed(getTokenPriceDecimals(latestPrice)),
            USD_DECIMALS
          );
          token.maxPrice = token.minPrice;
          token.candlePrices = latestPrices;
        }
      } else {
        token.minPrice = vaultTokenInfo[i * vaultPropsLength + 10];
        token.maxPrice = vaultTokenInfo[i * vaultPropsLength + 11];
      }

      token.averagePrice = token.minPrice.add(token.maxPrice).div(2);
      // guaranteedUsd tracks the amount of USD that is "guaranteed" by opened leverage positions
      // this value is used to calculate the redemption values for selling of USDG
      // this is an estimated amount, it is possible for the actual guaranteed value to be lower
      // in the case of sudden price decreases, the guaranteed value should be corrected
      // after liquidations are carried out
      token.guaranteedUsd = vaultTokenInfo[i * vaultPropsLength + 12];
      // ChainLink price (it's a SC internal implementation detail)
      // token.minPrimaryPrice = vaultTokenInfo[i * vaultPropsLength + 13];
      // token.maxPrimaryPrice = vaultTokenInfo[i * vaultPropsLength + 14];

      // add token balances
      if (token.balance) {
        token.balanceUsdMax = token.balance
          .mul(token.maxPrice)
          .div(expandDecimals(token.decimals));

        token.balanceUsdMin = token.balance
          .mul(token.minPrice)
          .div(expandDecimals(token.decimals));
      }

      token.availableUsd = token.isStable
        ? token.poolAmount
            .mul(token.minPrice)
            .div(expandDecimals(token.decimals))
        : token.availableAmount
            .mul(token.minPrice)
            .div(expandDecimals(token.decimals));

      if (token.maxGlobalShortSize.gt(0)) {
        if (token.maxGlobalShortSize.gt(token.globalShortSize)) {
          token.maxAvailableShort = token.maxGlobalShortSize.sub(
            token.globalShortSize
          );
        }
      }

      if (token.maxGlobalLongSize.gt(0)) {
        if (token.maxGlobalLongSize.gt(token.guaranteedUsd)) {
          const remainingLongSize = token.maxGlobalLongSize.sub(
            token.guaranteedUsd
          );
          const maxAvailableLong = remainingLongSize.lt(token.availableUsd)
            ? remainingLongSize
            : token.availableUsd;
          token.maxAvailableLong = maxAvailableLong.lt(token.availableUsd)
            ? maxAvailableLong
            : token.availableUsd;
        }
      } else {
        token.maxAvailableLong = token.availableUsd;
      }

      token.maxLongCapacity =
        token.maxGlobalLongSize.gt(0) &&
        token.maxGlobalLongSize.lt(token.availableUsd.add(token.guaranteedUsd))
          ? token.maxGlobalLongSize
          : token.availableUsd.add(token.guaranteedUsd);

      token.managedUsd = token.availableUsd.add(token.guaranteedUsd);
      token.managedAmount = token.minPrice.isZero()
        ? BigNumber.from(0)
        : token.managedUsd
            .mul(expandDecimals(token.decimals))
            .div(token.minPrice);
    }

    tokenInfoMap[token.address.toLowerCase()] = token;
  }

  return tokenInfoMap;
};
