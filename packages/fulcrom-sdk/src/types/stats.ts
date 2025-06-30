import type { StringNumber } from "./alias";

export type PositionStats = {
  totalActivePositions: number;
  totalLongPositionCollaterals: StringNumber;
  totalLongPositionSizes: StringNumber;
  totalShortPositionCollaterals: StringNumber;
  totalShortPositionSizes: StringNumber;
};

export type TokenVolume = {
  id: string;
  token: string;
  margin: StringNumber;
  timestamp: StringNumber;
};

export type FastPrice = {
  id: string;
  token: string;
  value: StringNumber;
  timestamp: number;
  blockNumber: number;
  period: string;
};

export type HourlyVolume = {
  id: StringNumber;
} & Volume;

export type DailyVolume = {
  marginCumulative: StringNumber;
  mintCumulative: StringNumber;
  burnCumulative: StringNumber;
  swapCumulative: StringNumber;
  liquidationCumulative: StringNumber;
} & HourlyVolume;

export type Volume = {
  timestamp: StringNumber;
  burn: StringNumber;
  liquidation: StringNumber;
  margin: StringNumber;
  mint: StringNumber;
  swap: StringNumber;
};

export type TradingStat = {
  longOpenInterest: StringNumber;
  shortOpenInterest: StringNumber;
};

export type PricePeriod = "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

export type PriceCandle = {
  // timestamp in seconds
  time: number;
  // open price
  open: number;
  // close price
  close: number;
  // high price
  high: number;
  // low price
  low: number;
};
