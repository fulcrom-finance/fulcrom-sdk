import { BigNumber } from "@ethersproject/bignumber";
import type { ChainId, Token, TokenInfo } from "../../types";
import { getContractAddress } from "../../config";
import { getTotalSupply } from "../../query/erc20/totalSupply";
import { getTotalWeight } from "../../query/totalWeight";
import { getTradeOrderSwapFeeBps } from "./tradeOrderSwapFee";
import { cacheKeys, getDataWithCache } from "../../cache";

export const getOrderSwapFeeBps = async (
  chainId: ChainId,
  isLong: boolean,
  fromAmount: BigNumber,
  fromTokenInfo: TokenInfo,
  shortCollateralTokenInfo: TokenInfo,
  toTokenInfo: TokenInfo,
  caches: Map<string, any>
): Promise<number> => {
  const usdgSupply = await getDataWithCache<BigNumber, [ChainId, string]>(
    caches,
    cacheKeys.UsdgSypply,
    getTotalSupply,
    chainId,
    getContractAddress("USDG", chainId)
  );

  const totalWeight = await getDataWithCache(
    caches,
    cacheKeys.TotalWeight,
    getTotalWeight,
    chainId
  );
  return getTradeOrderSwapFeeBps({
    order: {
      collateralToken: isLong
        ? toTokenInfo.address
        : shortCollateralTokenInfo.address,
      indexToken: toTokenInfo.address,
      isLong,
      purchaseToken: fromTokenInfo.address,
      purchaseTokenAmount: fromAmount,
    },
    totalWeight,
    usdgSupply,
    toTokenInfo,
    purchaseTokenInfo: fromTokenInfo,
    collateralTokenInfo: shortCollateralTokenInfo,
  });
};
