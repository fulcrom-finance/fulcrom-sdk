import fetch from "node-fetch";
import { getTokenBySymbol, TokenSymbol } from "../../config";
import { ChainId, Token } from "../../types";
import {
  dataFormats,
  getFetchUrl,
  PriceData,
  timeDiff,
  TokenPriceParams,
  Response,
} from "./getPriceData";
import { objectFromEntries } from "../../utils/objectFromEntries";

const DEFAULT_PRICE_CHART_PERIOD = "5m";
const DEFAULT_PERIOD_COUNT = 1;
export const getLastTokensPriceData = async ({
  chainId,
  tokens,
}: {
  chainId: ChainId;
  tokens: Token[];
}) => {
  const tokensSymbol = tokens.map((token) => token.symbol);

  return getTokensPriceData({ symbols: tokensSymbol, chainId }).then((data) => {
    const tokenToPriceCandleMap = objectFromEntries(
      data.map((v, index) => {
        const cleaned = v.prices.filter((v) => !!v);

        return [tokensSymbol[index], cleaned];
      })
    );

    return tokenToPriceCandleMap;
  });
};

type CallResponse = {
  tokens: Response[];
};

const getMultiTokenFetchUrl = () => `${getFetchUrl()}/multiple_tokens`;

export const getTokensPriceData = async ({
  chainId,
  symbols,
  period = DEFAULT_PRICE_CHART_PERIOD,
  periodCount = DEFAULT_PERIOD_COUNT,
}: Omit<TokenPriceParams, "symbol"> & {
  chainId: ChainId;
  symbols: TokenSymbol[];
}): Promise<PriceData[]> => {
  const [now, from] = timeDiff({ period, periodCount });
  const tokens = symbols
    .map(
      (symbol) =>
        `tokens=${getTokenBySymbol(symbol, chainId).candlePriceSymbol}`
    )
    .join("&");
  const url = `${getMultiTokenFetchUrl()}?${tokens}&period=${period}&from=${from}&to=${now}`;
  const res = await fetch(url);
  const response = (await res.json()) as CallResponse;

  return response?.tokens?.map((item) => {
    return dataFormats(item);
  });
};
