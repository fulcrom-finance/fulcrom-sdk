import { expandDecimals, getChainInfo, getTokenBySymbol } from "../../config";
import { BIG_NUM_ZERO } from "../../config/zero";
import { Address, CachesMap, ChainId } from "../../types";
import { getTokensInfo } from "../getTokensInfo";
import { getNativeBalance } from "./getNativeBalance";
import { NativeTokenInfo } from "./types";

export const getEthTokenInfo = async (
  account: Address,
  chainId: ChainId,
  caches: CachesMap<any>
): Promise<NativeTokenInfo> => {
  const token = getTokenBySymbol("ETH", chainId);
  const ethBalanceUsd = await getEthBalanceUsd(account, chainId, caches);

  return {
    symbol: "ETH",
    // address: token.address,
    // candlePriceSymbol: token.candlePriceSymbol,
    // pythTokenId: token.pythTokenId,
    // baseTokenImage: token.baseTokenImage,
    // baseTokenSymbol: token.baseTokenSymbol,
    image: token.image,
    balanceUsdMin: ethBalanceUsd || BIG_NUM_ZERO,
    decimals: token.decimals,
    displayDecimals: token.displayDecimals,
    displaySymbol: "ETH",
  };
};

export const getEthBalanceUsd = async (
  account: Address,
  chainId: ChainId,
  caches: CachesMap<any>
) => {
  const nativeBalance = await getNativeBalance({ account, chainId });
  const token = getTokenBySymbol("ETH", chainId);

  const tokensInfo = await getTokensInfo({
    account,
    chainId,
    tokens: [token],
    caches,
  });

  const liveInfo = tokensInfo[token.address];

  const chainInfo = getChainInfo(chainId);

  if (!nativeBalance || !liveInfo || chainInfo.nativeCurrency.symbol !== "ETH")
    return undefined;

  return nativeBalance
    .mul(liveInfo?.minPrice)
    .div(expandDecimals(liveInfo.decimals));
};
