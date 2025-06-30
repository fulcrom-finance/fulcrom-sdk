import type { TradingEventAction } from "../graphql/getTradingEvents";

export type GetTradingEventsOptions<A extends TradingEventAction> = {
  account: string;
  action_in?: A[] | readonly A[];
  first?: number;
  skip?: number;
};

export type GetMultiAccountsTradingEventsOptions<A extends TradingEventAction> =
  Omit<GetTradingEventsOptions<A>, "account"> & {
    account_in?: string[];
  };

export const getTradingEventsQuery = <A extends TradingEventAction>({
  account,
  action_in,
  first,
  skip,
}: GetTradingEventsOptions<A>) => {
  const actionQuery = action_in ? `action_in: [${action_in.join(",")}]` : "";
  const firstQuery = `first: ${first || 100}`;
  const skipQuery = `skip: ${skip || 0}`;

  return `tradingEvents(
    ${firstQuery}
    ${skipQuery}
    where: {account: "${account?.toLowerCase()}" ${actionQuery}}
    orderBy: timestamp
    orderDirection: desc) {
          id
          action
          account
          txhash
          timestamp
          params
        }`;
};

export const getMultiAccountsTradingEventsQuery = <
  A extends TradingEventAction
>({
  account_in,
  action_in,
  first,
  skip,
}: GetMultiAccountsTradingEventsOptions<A>) => {
  const actionQuery = action_in ? `action_in: [${action_in.join(",")}]` : "";
  const accountQuery = account_in
    ? `account_in: [${account_in.map((item) => `"${item}"`).join(",")}]`
    : "";
  const firstQuery = `first: ${first || 100}`;
  const skipQuery = `skip: ${skip || 0}`;

  return `tradingEvents(
    ${firstQuery}
    ${skipQuery}
    where: {${accountQuery}, ${actionQuery}}
    orderBy: timestamp
    orderDirection: desc) {
          id
          action
          account
          txhash
          timestamp
          params
        }`;
};
