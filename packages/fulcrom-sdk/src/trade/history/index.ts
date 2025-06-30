import {
  TRADE_HISTORY_TRADE_EVENTS,
} from "../../config/tradeEvents";
import {
  getTradingEvents,
  TradingEventAction,
} from "../../query/graphql/getTradingEvents";
import { Address, ChainId } from "../../types";
import { formattedTradingEvents } from "../utils/tradingEvents";

export const getHistory = async ({
  account,
  chainId,
  filters,
  pagination = {
    page: 1,
    limit: 20,
  },
}: {
  account: Address;
  chainId: ChainId;
  filters: TradingEventAction[];
  pagination?: {
    page: number;
    limit: number;
  };
}) => {
  /*const fullEvents = isExecutedEventOnly
    ? LIVE_FEED_EVENT_ACTIONS
    : TRADE_HISTORY_TRADE_EVENTS;*/

  const fullEvents = TRADE_HISTORY_TRADE_EVENTS;

  const tradingEvents = await getTradingEvents(chainId, {
    account,
    action_in: fullEvents.filter((action) => filters.includes(action)),
    first: pagination.limit,
    skip: (pagination?.page - 1) * pagination?.limit,
  });

  const data = formattedTradingEvents(tradingEvents, chainId);

  return data;
};
