import { cacheKeys, getDataWithCache } from "../cache";
import { getLastTokensPriceData } from "../query/stats/getLastTokensPriceData";
import { Address, ChainId, Token } from "../types";
import { getTokenBalances } from "./getTokenBalances";
import { getInfoTokenMap } from "./getTokenInfoMap";
import { getVaultTokenInfo } from "./getVaultTokenInfo";

export const getTokensInfo = async ({
  account,
  chainId,
  tokens,
  caches,
}: {
  account: Address;
  chainId: ChainId;
  tokens: Token[];
  caches: Map<string, any>;
}) => {
  const tokensPriceData = await getDataWithCache(
    caches,
    cacheKeys.TokensPriceData,
    getLastTokensPriceData,
    {
      tokens,
      chainId,
    }
  );
  const balances = await getDataWithCache(
    caches,
    cacheKeys.Balances,
    getTokenBalances,
    account,
    chainId,
    tokens.map((item) => item.address)
  );

  const vaultTokenInfo = await getDataWithCache(
    caches,
    cacheKeys.VaultTokenInfo,
    getVaultTokenInfo,
    chainId
  );
  return getInfoTokenMap({
    tokens,
    balances,
    vaultTokenInfo,
    tokensPriceData,
    chainId,
  });
};
