import { getTradesGraphUrl } from "../../../config/api";
import { ChainId } from "../../../types";
import { getCommonOptions } from "../commonOptions";
import type {
  GetMultiAccountsTradingEventsOptions,
  GetTradingEventsOptions,
} from "../../gql/tradingEvents";
import {
  getMultiAccountsTradingEventsQuery,
  getTradingEventsQuery,
} from "../../gql/tradingEvents";
import type { TradingEvent, TradingEventAction } from "./types";

export const getTradingEvents = async <A extends TradingEventAction>(
  chainId: ChainId,
  options: GetTradingEventsOptions<A>
): Promise<TradingEvent<A>[]> => {
  const query = getTradingEventsQuery(options);
  const res = await fetch(getTradesGraphUrl(chainId), getCommonOptions(query));

  const response = await res.json();

  return response.data.tradingEvents;
};

export const getMultiAccountsTradingEvents = async <
  A extends TradingEventAction
>(
  chainId: ChainId,
  options: GetMultiAccountsTradingEventsOptions<A>
): Promise<TradingEvent<A>[]> => {
  const query = getMultiAccountsTradingEventsQuery(options);
  const res = await fetch(getTradesGraphUrl(chainId), getCommonOptions(query));

  const response = await res.json();

  return response.data.tradingEvents;
};
