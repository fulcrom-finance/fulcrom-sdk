import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { getChainInfo } from "../config";
import type { ChainId } from "../types";

export function createProvider(chainId: ChainId) {
  const { rpcUrl, label, ensAddress } = getChainInfo(chainId);

  return new StaticJsonRpcProvider(
    {
      url: rpcUrl,
      skipFetchSetup: !!process.env.SKIP_FETCH_SETUP, // skip fetch setup to avoid unnecessary network requests
    },
    {
      name: label,
      chainId,
      ensAddress,
    }
  );
}

export function createWsProvider(chainId: ChainId) {
  const { wsUrl, label } = getChainInfo(chainId);

  return new StaticJsonRpcProvider(wsUrl, {
    name: label,
    chainId,
  });
}

/**
 * providers are created and cached in a record with the
 *  chainId as the access key
 */
type ProviderMap = Map<ChainId, StaticJsonRpcProvider>;
const providerMap: ProviderMap = new Map<ChainId, StaticJsonRpcProvider>();

/**
 * Create static json providers and cache it in memory
 * Use `createProvider` instead, if you don't want cache
 *
 * @param chainId
 * @returns a StaticJsonRpcProvider provider instance
 */
export function getProvider(chainId: ChainId): StaticJsonRpcProvider {
  if (!providerMap.get(chainId)) {
    const provider = createProvider(chainId);
    providerMap.set(chainId, provider);
  }

  return providerMap.get(chainId) as StaticJsonRpcProvider;
}
