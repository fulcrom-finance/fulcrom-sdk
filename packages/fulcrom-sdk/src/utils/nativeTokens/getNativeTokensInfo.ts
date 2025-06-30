import { getChainInfo, TokenSymbol } from "../../config";
import { BIG_NUM_ZERO } from "../../config/zero";
import { Address, BasicTokenInfo, CachesMap, ChainId } from "../../types";
import { getCroTokenInfo } from "./getCroTokenInfo";
import { getEthTokenInfo } from "./getEthTokenInfo";
import { getIsEthNative } from "./getIsEthNative";
import { getNativeBalance } from "./getNativeBalance";

export const getIsNative = (symbol: TokenSymbol, chainId: ChainId) => {
  return getChainInfo(chainId).nativeCurrency.symbol === symbol;
};

export const getNativeTokensInfo = async ({
  account,
  chainId,
  caches,
}: {
  account: Address;
  chainId: ChainId;
  caches: CachesMap<any>;
}): Promise<BasicTokenInfo> => {
  const nativeBalance =
    (await getNativeBalance({ account, chainId })) || BIG_NUM_ZERO;

  const isEth = getIsEthNative(chainId);
  const croInfo = await getCroTokenInfo(account, chainId, caches);
  const ethInfo = await getEthTokenInfo(account, chainId, caches);

  if (isEth) {
    return {
      ...ethInfo,
      balance: nativeBalance,
    };
  } else {
    return {
      ...croInfo,
      balance: nativeBalance,
    };
  }
};
