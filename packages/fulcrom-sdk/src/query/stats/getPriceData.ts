import { getTokenBySymbol, TokenSymbol } from "../../config";
import { ChainId, PriceCandle, PricePeriod } from "../../types";
import { getStatsAPIUrl } from "../../config/api";

export const PERIOD_VALUES: Record<PricePeriod, number> = {
  "5m": 60 * 5,
  "15m": 60 * 15,
  "1h": 60 * 60,
  "4h": 60 * 60 * 4,
  "1d": 60 * 60 * 24,
  "1w": 60 * 60 * 24 * 7,
};

export type Price = {
  // timestamp in seconds
  t: number;
  // open price
  o: number;
  // close price
  c: number;
  // highest price
  h: number;
  // lowest price
  l: number;
};
export type Response = {
  period: PricePeriod;
  updatedAt: number;
  valley: Price;
  peak: Price;
  prices: Price[];
};

export type TokenPriceParams = {
  symbol: TokenSymbol;
  period?: PricePeriod;
  periodCount?: number;
};

export type PriceData = {
  prices: PriceCandle[];
  valley?: PriceCandle;
  peak?: PriceCandle;
};

export const getFetchUrl = () => `${getStatsAPIUrl()}/candle_by_range`;

export const priceToPriceCandle = ({
  t: time,
  o: open,
  c: close,
  l: low,
  h: high,
}: Price) => ({
  time,
  open,
  close,
  high,
  low,
});

export const timeDiff = ({
  period = "5m",
  periodCount = 3000,
}: Omit<TokenPriceParams, "symbol">) => {
  const timeDiff = (PERIOD_VALUES[period] || PERIOD_VALUES["5m"]) * periodCount;
  const now = Math.floor(Date.now() / 1000);
  const from = Math.floor(now - timeDiff);

  return [now, from];
};

export const dataFormats = (data: Response) => {
  return {
    valley: data.valley ? priceToPriceCandle(data.valley) : undefined,
    peak: data.peak ? priceToPriceCandle(data.peak) : undefined,
    prices: data.prices.map(priceToPriceCandle),
  };
};

export const getPriceData = (chainId: ChainId) => ({
  queryKey: [getFetchUrl(), String(chainId)],
  queryFn: async ({
    symbol,
    period,
    periodCount = 3000,
  }: TokenPriceParams): Promise<PriceData> => {
    const [now, from] = timeDiff({ period, periodCount });
    const url = `${getFetchUrl()}?token=${
      getTokenBySymbol(symbol, chainId).candlePriceSymbol
    }&period=${period}&from=${from}&to=${now}`;
    const res = await fetch(url);
    const response = (await res.json()) as Response;

    return dataFormats(response);
  },
});
