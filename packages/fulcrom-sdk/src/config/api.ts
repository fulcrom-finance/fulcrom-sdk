import { ChainId, ChainName } from "../types";
import { getChainName } from "../utils";

const SUBGRAPH_ENDPOINT = process.env.FULCROM_SDK_GRAPHQL_ENDPOINT;
const TRADES_GRAPHQL_URI = process.env.FULCROM_SDK_TRADES_GRAPHQL_URI;

if (!SUBGRAPH_ENDPOINT) {
  throw new Error("FULCROM_SDK_GRAPHQL_ENDPOINT is not set");
}
if (!TRADES_GRAPHQL_URI) {
  throw new Error("FULCROM_SDK_TRADES_GRAPHQL_URI is not set");
}

const TRADES_SUBGRAPH_API_URLS = `${SUBGRAPH_ENDPOINT}/${TRADES_GRAPHQL_URI}`;

const TRADES_SUBGRAPH_URLS: Record<ChainName, string> = {
  [ChainName.CRONOS]: TRADES_SUBGRAPH_API_URLS,
};

export const getStatsAPIUrl = (): string => {
  if (!process.env.FULCROM_SDK_PUBLIC_CANDLE_ENDPOINT) {
    throw new Error("FULCROM_SDK_PUBLIC_CANDLE_ENDPOINT is not set");
  }
  // price stats api is by env, not chain
  return process.env.FULCROM_SDK_PUBLIC_CANDLE_ENDPOINT;
};

export const getTradesGraphUrl = (chainId: ChainId): string => {
  return TRADES_SUBGRAPH_URLS[getChainName(chainId)];
};
