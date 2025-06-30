import type { BigNumber } from "@ethersproject/bignumber";
import { TradingEventAction } from "../query/graphql/getTradingEvents";
import { Token } from "../types";
import { expandDecimals, USD_DECIMALS } from "./constants";

export const TRADE_HISTORY_TRADE_EVENTS = Object.freeze([
  TradingEventAction.CreateIncreasePosition,
  TradingEventAction.ExecuteIncreasePosition,
  TradingEventAction.CancelIncreasePosition,

  TradingEventAction.CreateDecreasePosition,
  TradingEventAction.ExecuteDecreasePosition,
  TradingEventAction.CancelDecreasePosition,

  TradingEventAction.CreateIncreaseOrder,
  TradingEventAction.UpdateIncreaseOrder,
  TradingEventAction.ExecuteIncreaseOrder,
  TradingEventAction.CancelIncreaseOrder,

  TradingEventAction.CreateDecreaseOrder,
  TradingEventAction.UpdateDecreaseOrder,
  TradingEventAction.ExecuteDecreaseOrder,
  TradingEventAction.CancelDecreaseOrder,

  TradingEventAction.LiquidatePosition,
  TradingEventAction.PartialLiquidation,
] as const);

export type TradeHistoryTradingEventAction =
  (typeof TRADE_HISTORY_TRADE_EVENTS)[number];

export const getTradingEventActionLabel = (
  action: LiveFeedEventActions,
  sizeDelta: BigNumber
): string | undefined => {
  if (action === TradingEventAction.LiquidatePosition) {
    return `Liquidated`;
  }

  if (action === TradingEventAction.PartialLiquidation) {
    return `Partial Liquidated`;
  }

  if (action === TradingEventAction.ExecuteIncreasePosition) {
    const isDepositMore = sizeDelta.isZero();

    if (isDepositMore) {
      return "Deposit Collateral";
    }

    return `Increase Position`;
  }

  if (action === TradingEventAction.ExecuteIncreaseOrder) {
    return `Increase Position`;
  }

  if (action === TradingEventAction.ExecuteDecreasePosition) {
    const isWithdraw = sizeDelta.isZero();

    if (isWithdraw) {
      return "Withdraw Collateral";
    }

    return `Decrease Position`;
  }

  if (action === TradingEventAction.ExecuteDecreaseOrder) {
    return `Decrease Position`;
  }

  return undefined;
};

export const getTradingEventActionValue = (
  action: LiveFeedEventActions,
  sizeDelta: BigNumber,
  collateralDelta?: BigNumber,
  amountIn?: BigNumber,
  collateralToken?: Token,
  markPrice?: BigNumber,
  isLong?: boolean
) => {
  if (
    action === TradingEventAction.LiquidatePosition ||
    action === TradingEventAction.PartialLiquidation ||
    action === TradingEventAction.ExecuteIncreaseOrder ||
    action === TradingEventAction.ExecuteDecreaseOrder
  ) {
    return {
      value: sizeDelta,
      decimals: USD_DECIMALS,
    };
  }

  if (action === TradingEventAction.ExecuteIncreasePosition) {
    const isDepositMore = sizeDelta.isZero();

    if (isDepositMore) {
      if (isLong) {
        return {
          value: amountIn
            ?.mul(markPrice ?? 0)
            .div(expandDecimals(collateralToken?.decimals ?? 0)),
          decimals: USD_DECIMALS,
        };
      }

      return {
        value: amountIn,
        decimals: collateralToken?.decimals,
      };
    }

    return {
      value: sizeDelta,
      decimals: USD_DECIMALS,
    };
  }

  if (action === TradingEventAction.ExecuteDecreasePosition) {
    const isWithdraw = sizeDelta.isZero();

    if (isWithdraw) {
      return {
        value: collateralDelta,
        decimals: USD_DECIMALS,
      };
    }

    return {
      value: sizeDelta,
      decimals: USD_DECIMALS,
    };
  }

  return {};
};

export const LIVE_FEED_EVENT_ACTIONS = Object.freeze([
  TradingEventAction.LiquidatePosition,
  TradingEventAction.PartialLiquidation,
  TradingEventAction.ExecuteIncreasePosition,
  TradingEventAction.ExecuteDecreasePosition,
  TradingEventAction.ExecuteIncreaseOrder,
  TradingEventAction.ExecuteDecreaseOrder,
] as const);

export type LiveFeedEventActions = (typeof LIVE_FEED_EVENT_ACTIONS)[number];

export const isIncrease = (action: LiveFeedEventActions) => {
  switch (action) {
    case TradingEventAction.ExecuteIncreasePosition:
    case TradingEventAction.ExecuteIncreaseOrder:
      return true;
    case TradingEventAction.LiquidatePosition:
    case TradingEventAction.PartialLiquidation:
    case TradingEventAction.ExecuteDecreasePosition:
    case TradingEventAction.ExecuteDecreaseOrder:
      return false;
    default:
      return null;
  }
};
