import { BigNumber } from "@ethersproject/bignumber";
import {
  CRO_DECIMALS,
  expandDecimals,
  getChainInfo,
  getTokenBySymbol,
} from "../../config";
import { BIG_NUM_ZERO } from "../../config/zero";
import { NativeTokenInfo } from "./types";
import { Address, CachesMap, ChainId } from "../../types";
import { getCronosCroPoolReserves } from "../../query/tokens/getCronosCroPoolReserves";
import { getTokensInfo } from "../getTokensInfo";
import { getNativeBalance } from "./getNativeBalance";

// export const getIsCronosEvm = (chainId: ChainId) => {
//   return getChainName(chainId) === ChainName.CRONOS_EVM;
// };

export const getCroPrice = async (
  account: Address,
  chainId: ChainId,
  caches: CachesMap<any>
) => {
  const cronosCroPoolReverses = await getCronosCroPoolReserves(chainId);
  const token = getTokenBySymbol("USDC", chainId);
  const tokensInfo = await getTokensInfo({
    account,
    chainId,
    tokens: [token],
    caches,
  });

  const usdcInfo = tokensInfo[token.address];

  if (!cronosCroPoolReverses || !usdcInfo?.minPrice || !usdcInfo?.decimals)
    return undefined;

  const { pairTokenReserve, croReserve } = cronosCroPoolReverses;

  if (!pairTokenReserve || !croReserve) return undefined;

  if (pairTokenReserve.isZero() || croReserve.isZero())
    return BigNumber.from(0);

  const PRECISION = expandDecimals(CRO_DECIMALS);

  return pairTokenReserve
    .mul(usdcInfo.minPrice)
    .div(expandDecimals(usdcInfo.decimals))
    .mul(PRECISION)
    .div(croReserve);
};

export const getCroBalanceUsd = async (
  account: Address,
  chainId: ChainId,
  caches: CachesMap<any>
) => {
  const nativeBalance = await getNativeBalance({ account, chainId });
  const croPrice = await getCroPrice(account, chainId, caches);

  if (!nativeBalance || !croPrice) return undefined;

  return nativeBalance.mul(croPrice).div(expandDecimals(CRO_DECIMALS));
};

export const getCroTokenInfo = async (
  account: Address,
  chainId: ChainId,
  caches: CachesMap<any>
): Promise<NativeTokenInfo> => {
  const croBalanceUsd = await getCroBalanceUsd(account, chainId, caches);
  //   const isCronosEvm = getIsCronosEvm(chainId);

  //   return isCronosEvm ? zkCRO(croBalanceUsd) : CRO(croBalanceUsd);
  return {
    ...getChainInfo(chainId).nativeCurrency,
    balanceUsdMin: croBalanceUsd || BIG_NUM_ZERO,
  };
};

// const zkCRO = (croBalanceUsd: BigNumber | undefined): NativeTokenInfo => ({
//   ...CRO(croBalanceUsd),
//   image: "/tokens/zkCRO.svg",
//   displaySymbol: "zkCRO",
//   symbol: "zkCRO",
// });
