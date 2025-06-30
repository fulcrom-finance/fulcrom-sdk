 
import { BigNumber } from "@ethersproject/bignumber";
import {
  TradingEvent as GraphqlTradingEvent,
  TradingEventAction,
} from "../query/graphql/getTradingEvents";
import { Address, StringNumber } from "./alias";
import { Token } from "./token";

export type PositionEventParams =
  | ExecuteIncreasePositionEventParams
  | ExecuteDecreasePositionEventParams
  | IncreasePositionEventParams
  | DecreasePositionEventParams;

export type IncreasePositionEventParams = {
  // in USD_DECIMALS
  acceptablePrice: BigNumber;
  // in token(path[0]).decimals
  amountIn: BigNumber;
  // in 18 decimals(cro)
  executionFee: BigNumber;
  // e.g. '0'
  index: string;
  indexToken: Token["address"];
  isLong: boolean;
  // e.g. '0'
  minOut: string;
  /**
   * path = [toToken's address]
   * path = [fromToken's address, toToken's address]
   */
  path: Token["address"][];
  // e.g. '0'
  queueIndex: string;
  // in USD_DECIMALS
  sizeDelta: BigNumber;

  sl: BigNumber;
  tp: BigNumber;
  tpSlExecutionFee: BigNumber;
};

export type ExecuteIncreasePositionEventParams = IncreasePositionEventParams & {
  executionPrice: BigNumber;
  size: BigNumber;
  collateral: BigNumber;
  reserveAmount: BigNumber;
  averagePrice: BigNumber;
  markPrice: BigNumber;
  collateralDelta: BigNumber;
  marginFee: StringNumber;
  price: BigNumber;
  originalAcceptablePrice: BigNumber;

  maxLeverage: BigNumber;
  fixedLiquidationFeeUsd: BigNumber;
  prevCollateral: BigNumber;

  realisedPnl: BigNumber;

  sl: BigNumber;
  tp: BigNumber;
  tpSlExecutionFee: BigNumber;
};

export interface CreateIncreasePositionEventParams
  extends IncreasePositionEventParams {
  index: StringNumber;
  queueIndex: StringNumber;
  prevSize: BigNumber;
  prevCollateral: BigNumber;
  prevRealisedPnl: StringNumber;

  sl: BigNumber;
  tp: BigNumber;
  tpSlExecutionFee: BigNumber;
}

export interface DepositCollateralExecutedEventParams
  extends Omit<
    ExecuteIncreasePositionEventParams,
    "collateral" | "collateralDelta" | "marginFee" | "size"
  > {
  collateral: BigNumber;
  collateralDelta: BigNumber;
  marginFee: BigNumber;
  size: BigNumber;
  executionFee: BigNumber;
}

export type DecreasePositionEventParams = {
  // in USD_DECIMALS
  acceptablePrice: BigNumber;
  // in USD_DECIMALS
  collateralDelta: BigNumber;
  // in 18 decimals(cro)
  executionFee: BigNumber;
  // e.g. '0'
  index: string;
  indexToken: Token["address"];
  isLong: boolean;
  // e.g. '0'
  minOut: string;
  /**
   * path = [toToken's address]
   * path = [fromToken's address, toToken's address]
   */
  path: Token["address"][];
  // e.g. '0'
  queueIndex: string;
  // account address
  receiver: string;
  // in USD_DECIMALS
  sizeDelta: BigNumber;
  prevSize: BigNumber;
  prevCollateral: BigNumber;
  prevRealisedPnl: StringNumber;
};

export type ExecuteDecreasePositionEventParams = Omit<
  DecreasePositionEventParams,
  "prevSize" | "prevRealisedPnl"
> & {
  adjustedDelta: StringNumber;
  hasProfit: boolean;
  realizedPnl: BigNumber; //has +/- symbol

  collectMarginFeeInUsd: BigNumber;
  collectMarginFeeInTokens: StringNumber;
  collectMarginFeeToken: Address;

  collectSwapFeeInUsd?: BigNumber;
  collectSwapFeeInTokens?: StringNumber;
  collectSwapFeeToken?: Address;

  // new size after sizeDelta change
  size: BigNumber;
  // initial collateral amount of the trade
  collateral: BigNumber;
  reserveAmount: StringNumber;
  averagePrice: BigNumber;
  markPrice: BigNumber;
  executionPrice: BigNumber;

  originalAcceptablePrice: BigNumber;

  maxLeverage: BigNumber;
  fixedLiquidationFeeUsd: BigNumber;
};

export type IncreaseOrderEventParams = {
  collateralToken: Token["address"];
  // in 18 decimals(cro)
  executionFee: BigNumber;
  indexToken: Token["address"];
  isLong: boolean;
  // e.g. '0'
  orderIndex: string;
  purchaseToken?: Token["address"];
  purchaseTokenAmount?: string;
  // in USD_DECIMALS
  sizeDelta: BigNumber;
  triggerAboveThreshold: boolean;
  // in USD_DECIMALS
  triggerPrice: BigNumber;
  prevSize?: BigNumber;

  sl: BigNumber;
  tp: BigNumber;
  tpSlExecutionFee: BigNumber;
};

export type ExecuteIncreaseOrderEventParams = IncreaseOrderEventParams & {
  // in USD_DECIMALS
  executionPrice: BigNumber;
  size: BigNumber;
  collateral: BigNumber;
  collateralDelta: BigNumber;
  prevCollateral: BigNumber;
  markPrice: BigNumber;
  marginFee: StringNumber;

  maxLeverage: BigNumber;
  fixedLiquidationFeeUsd: BigNumber;
  averagePrice: BigNumber;

  sl: BigNumber;
  tp: BigNumber;
  tpSlExecutionFee: BigNumber;
};

export type DecreaseOrderEventParams = IncreaseOrderEventParams & {
  prevSize: BigNumber;
  prevCollateral: BigNumber;
  prevRealisedPnl: StringNumber;
  collateralDelta: BigNumber;
};

export type ExecuteDecreaseOrderEventParams =
  ExecuteIncreaseOrderEventParams & {
    adjustedDelta: StringNumber;
    hasProfit: boolean;
    realizedPnl: BigNumber; //has +/- symbol

    collectMarginFeeInUsd: BigNumber;
    collectMarginFeeInTokens: StringNumber;
    collectMarginFeeToken: Address;

    collectSwapFeeInUsd?: BigNumber;
    collectSwapFeeInTokens?: StringNumber;
    collectSwapFeeToken?: Address;

    size: StringNumber;
    collateral: StringNumber;
    reserveAmount: StringNumber;
    averagePrice: BigNumber;
    markPrice: BigNumber;
    executionPrice: BigNumber;
  };

export type SwapOrderEventParams = {
  // in Token(path[0]).decimals
  amountIn: BigNumber;
  // in 18 decimals(cro)
  executionFee: BigNumber;
  // in Token(path[1]).decimals
  minOut: BigNumber;
  // e.g. '0'
  orderIndex: string;
  /**
   * path = [fromToken's address, toToken's address]
   */
  path: Token["address"][];
  shouldUnwrap: boolean;
  triggerAboveThreshold: boolean;

  // in USD_DECIMALS
  triggerRatio: BigNumber;
};

export type ExecuteSwapOrderEventParams = SwapOrderEventParams & {
  // in Token(path[1]).decimals
  amountOut: BigNumber;
};

export type SwapEventParams = {
  // in token(tokenIn).decimals
  amountIn: BigNumber;
  // in token(tokenOut).decimals
  amountOut: BigNumber;
  tokenIn: Token["address"];
  tokenOut: Token["address"];
  triggerRatio: BigNumber;
  minOut: BigNumber;
  path: Token["address"][];
};

type CommonLiquidatePositionEventParams = {
  key: string;
  indexToken: Token["address"];
  collateralToken: Token["address"];
  isLong: boolean;
  // in USD_DECIMALS
  markPrice: BigNumber;
  // in USD_DECIMALS
  size: BigNumber;
  collateral: BigNumber;
  collectMarginFeeInUsd: StringNumber;
  collectMarginFeeInTokens: StringNumber;
  collectMarginFeeToken: Address;
  realizedPnl: StringNumber; //has +/- symbol
};

export type LiquidatePositionEventParams = Omit<
  CommonLiquidatePositionEventParams,
  "collectMarginFeeInUsd"
> & {
  liquidationFee: BigNumber;
  collectMarginFeeInUsd: BigNumber;
};

export type PartialLiquidationEventParams =
  CommonLiquidatePositionEventParams & {
    leftTokenAmount: BigNumber;
    adjustedDelta: StringNumber;
    hasProfit: boolean;
  };

export type DepositCollateralExecutedEventDetails = {
  action: TradingEventAction.ExecuteIncreasePosition;
  paramsParsed: DepositCollateralExecutedEventParams;
};

export type TradingEventDetails =
  | {
      action: TradingEventAction.CreateIncreasePosition;
      paramsParsed: CreateIncreasePositionEventParams;
    }
  | {
      action: TradingEventAction.ExecuteIncreasePosition;
      paramsParsed: ExecuteIncreasePositionEventParams;
    }
  | DepositCollateralExecutedEventDetails
  | {
      action: TradingEventAction.CancelIncreasePosition;
      paramsParsed: IncreasePositionEventParams;
    }
  | {
      action: TradingEventAction.CreateDecreasePosition;
      paramsParsed: DecreasePositionEventParams;
    }
  | {
      action: TradingEventAction.ExecuteDecreasePosition;
      paramsParsed: ExecuteDecreasePositionEventParams;
    }
  | {
      action: TradingEventAction.CancelDecreasePosition;
      paramsParsed: DecreasePositionEventParams;
    }
  | {
      action: TradingEventAction.CreateIncreaseOrder;
      paramsParsed: IncreaseOrderEventParams;
    }
  | {
      action: TradingEventAction.UpdateIncreaseOrder;
      paramsParsed: IncreaseOrderEventParams;
    }
  | {
      action: TradingEventAction.ExecuteIncreaseOrder;
      paramsParsed: ExecuteIncreaseOrderEventParams;
    }
  | {
      action: TradingEventAction.CancelIncreaseOrder;
      paramsParsed: IncreaseOrderEventParams;
    }
  | {
      action: TradingEventAction.CreateDecreaseOrder;
      paramsParsed: DecreaseOrderEventParams;
    }
  | {
      action: TradingEventAction.UpdateDecreaseOrder;
      paramsParsed: DecreaseOrderEventParams;
    }
  | {
      action: TradingEventAction.ExecuteDecreaseOrder;
      paramsParsed: ExecuteDecreaseOrderEventParams;
    }
  | {
      action: TradingEventAction.CancelDecreaseOrder;
      paramsParsed: DecreaseOrderEventParams;
    }
  | {
      action: TradingEventAction.CreateSwapOrder;
      paramsParsed: SwapEventParams;
    }
  | {
      action: TradingEventAction.UpdateSwapOrder;
      paramsParsed: SwapEventParams;
    }
  | {
      action: TradingEventAction.ExecuteSwapOrder;
      paramsParsed: ExecuteSwapOrderEventParams;
    }
  | {
      action: TradingEventAction.CancelSwapOrder;
      paramsParsed: SwapEventParams;
    }
  | { action: TradingEventAction.Swap; paramsParsed: SwapEventParams }
  | {
      action: TradingEventAction.LiquidatePosition;
      paramsParsed: LiquidatePositionEventParams;
    }
  | {
      action: TradingEventAction.PartialLiquidation;
      paramsParsed: PartialLiquidationEventParams;
    };

export type TradingEvent<A extends TradingEventAction> =
  GraphqlTradingEvent<A> & Extract<TradingEventDetails, { action: A }>;

// FIXME: since collateral events share the same `action` type with position events,
// probably is not possible to `Extract` collateral events typings from `TradingEventDetails` by only typings
// because its condition requires a runtime check on `sizeDelta.eq(0)`
//
// Still, exports these types for convenience
export type DepositCollateralExecutedEvent =
  GraphqlTradingEvent<TradingEventAction.ExecuteIncreasePosition> & {
    action: TradingEventAction.ExecuteIncreasePosition;
    paramsParsed: DepositCollateralExecutedEventParams;
  };

type AnyTradingEvent = TradingEvent<TradingEventAction>;

export const isIncreasePositionEvent = (
  eventData: TradingEvent<TradingEventAction>
): eventData is TradingEvent<
  | TradingEventAction.CreateIncreasePosition
  | TradingEventAction.CancelIncreasePosition
  | TradingEventAction.ExecuteIncreasePosition
> => {
  return (
    eventData.action === TradingEventAction.CreateIncreasePosition ||
    eventData.action === TradingEventAction.CancelIncreasePosition ||
    eventData.action === TradingEventAction.ExecuteIncreasePosition
  );
};

export const isCreateIncreasePositionEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.CreateIncreasePosition> => {
  return eventData.action === TradingEventAction.CreateIncreasePosition;
};

export const isCreateDepositCollateralEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.CreateIncreasePosition> => {
  if (isCreateIncreasePositionEvent(eventData)) {
    const isDepositMore = eventData.paramsParsed.sizeDelta.eq(0);

    return isDepositMore;
  }

  return false;
};

// TODO: `DepositCollateralExecutedEvent` is special, since collateral management events
// share the same event type with position events, and require a runtime check on `sizeDelta`
// to distinguish between these types.
//
// Ideally, I think we might want to create a FE enum on top of `TradingEventAction`
// to include separate types for collateral events.
//
// But for now, to me(Anson) trading events typings are complicated and everywhere,
// let's note this down here and shall we come back to this later.
export const isExecuteDepositCollateralEvent = (
  eventData: AnyTradingEvent
): eventData is DepositCollateralExecutedEvent => {
  if (isExecuteIncreasePositionEvent(eventData)) {
    const isDepositMore = eventData.paramsParsed.sizeDelta.eq(0);

    return isDepositMore;
  }

  return false;
};

export const isExecuteIncreasePositionEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.ExecuteIncreasePosition> => {
  return eventData.action === TradingEventAction.ExecuteIncreasePosition;
};

export const isDecreasePositionEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateDecreasePosition
  | TradingEventAction.CancelDecreasePosition
  | TradingEventAction.ExecuteDecreasePosition
> => {
  return (
    eventData.action === TradingEventAction.CreateDecreasePosition ||
    eventData.action === TradingEventAction.CancelDecreasePosition ||
    eventData.action === TradingEventAction.ExecuteDecreasePosition
  );
};

export const isCreateDecreasePositionEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.CreateDecreasePosition> => {
  return eventData.action === TradingEventAction.CreateDecreasePosition;
};

export const isCreateWithdrawalCollateralEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.CreateDecreasePosition> => {
  if (isCreateDecreasePositionEvent(eventData)) {
    return eventData.paramsParsed.sizeDelta.eq(0);
  }

  return false;
};

export const isExecuteWithdrawalCollateralEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.ExecuteDecreasePosition> => {
  if (isExecuteDecreasePositionEvent(eventData)) {
    return eventData.paramsParsed.sizeDelta.eq(0);
  }

  return false;
};

export const isExecuteDecreasePositionEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.ExecuteDecreasePosition> => {
  return eventData.action === TradingEventAction.ExecuteDecreasePosition;
};

export const isTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateIncreaseOrder
  | TradingEventAction.UpdateIncreaseOrder
  | TradingEventAction.CancelIncreaseOrder
  | TradingEventAction.ExecuteIncreaseOrder
  | TradingEventAction.CreateDecreaseOrder
  | TradingEventAction.UpdateDecreaseOrder
  | TradingEventAction.CancelDecreaseOrder
  | TradingEventAction.ExecuteDecreaseOrder
> => {
  return (
    eventData.action === TradingEventAction.CreateIncreaseOrder ||
    eventData.action === TradingEventAction.UpdateIncreaseOrder ||
    eventData.action === TradingEventAction.CancelIncreaseOrder ||
    eventData.action === TradingEventAction.ExecuteIncreaseOrder ||
    eventData.action === TradingEventAction.CreateDecreaseOrder ||
    eventData.action === TradingEventAction.UpdateDecreaseOrder ||
    eventData.action === TradingEventAction.CancelDecreaseOrder ||
    eventData.action === TradingEventAction.ExecuteDecreaseOrder
  );
};

export const isIncreaseTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateIncreaseOrder
  | TradingEventAction.UpdateIncreaseOrder
  | TradingEventAction.CancelIncreaseOrder
  | TradingEventAction.ExecuteIncreaseOrder
> => {
  return (
    eventData.action === TradingEventAction.CreateIncreaseOrder ||
    eventData.action === TradingEventAction.UpdateIncreaseOrder ||
    eventData.action === TradingEventAction.CancelIncreaseOrder ||
    eventData.action === TradingEventAction.ExecuteIncreaseOrder
  );
};

export const isStopMarketOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateIncreaseOrder
  | TradingEventAction.UpdateIncreaseOrder
  | TradingEventAction.CancelIncreaseOrder
  | TradingEventAction.ExecuteIncreaseOrder
> => {
  return (
    isIncreaseTradeOrderEvent(eventData) &&
    eventData.paramsParsed.isLong ===
      eventData.paramsParsed.triggerAboveThreshold
  );
};

export const isLimitOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateIncreaseOrder
  | TradingEventAction.UpdateIncreaseOrder
  | TradingEventAction.CancelIncreaseOrder
  | TradingEventAction.ExecuteIncreaseOrder
> => {
  return (
    isIncreaseTradeOrderEvent(eventData) &&
    eventData.paramsParsed.isLong !==
      eventData.paramsParsed.triggerAboveThreshold
  );
};

export const isCreateIncreaseTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.CreateIncreaseOrder> => {
  return eventData.action === TradingEventAction.CreateIncreaseOrder;
};
export const isCreateOrUpdateIncreaseTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateIncreaseOrder
  | TradingEventAction.UpdateIncreaseOrder
> => {
  return (
    isCreateIncreaseTradeOrderEvent(eventData) ||
    eventData.action === TradingEventAction.UpdateIncreaseOrder
  );
};

export const isExecuteIncreaseTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.ExecuteIncreaseOrder> => {
  return eventData.action === TradingEventAction.ExecuteIncreaseOrder;
};

export const isDecreaseTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateDecreaseOrder
  | TradingEventAction.UpdateDecreaseOrder
  | TradingEventAction.CancelDecreaseOrder
  | TradingEventAction.ExecuteDecreaseOrder
> => {
  return (
    eventData.action === TradingEventAction.CreateDecreaseOrder ||
    eventData.action === TradingEventAction.UpdateDecreaseOrder ||
    eventData.action === TradingEventAction.CancelDecreaseOrder ||
    eventData.action === TradingEventAction.ExecuteDecreaseOrder
  );
};

export const isCreateDecreaseTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.CreateDecreaseOrder> => {
  return eventData.action === TradingEventAction.CreateDecreaseOrder;
};
export const isCreateOrUpdateDecreaseTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateDecreaseOrder
  | TradingEventAction.UpdateDecreaseOrder
> => {
  return (
    eventData.action === TradingEventAction.CreateDecreaseOrder ||
    eventData.action === TradingEventAction.UpdateDecreaseOrder
  );
};

export const isExecuteDecreaseTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.ExecuteDecreaseOrder> => {
  return eventData.action === TradingEventAction.ExecuteDecreaseOrder;
};

export const isExecuteTradeOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.ExecuteIncreaseOrder
  | TradingEventAction.ExecuteDecreaseOrder
> => {
  return (
    eventData.action === TradingEventAction.ExecuteIncreaseOrder ||
    eventData.action === TradingEventAction.ExecuteDecreaseOrder
  );
};

export const isSwapOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateSwapOrder
  | TradingEventAction.UpdateSwapOrder
  | TradingEventAction.CancelSwapOrder
  | TradingEventAction.ExecuteSwapOrder
> => {
  return (
    eventData.action === TradingEventAction.CreateSwapOrder ||
    eventData.action === TradingEventAction.UpdateSwapOrder ||
    eventData.action === TradingEventAction.CancelSwapOrder ||
    eventData.action === TradingEventAction.ExecuteSwapOrder
  );
};

export const isExecuteSwapOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.ExecuteSwapOrder> => {
  return eventData.action === TradingEventAction.ExecuteSwapOrder;
};

export const isSwapEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.Swap> => {
  return eventData.action === TradingEventAction.Swap;
};

export const isCreateSwapEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.CreateSwapOrder> => {
  return eventData.action === TradingEventAction.CreateSwapOrder;
};

export const isUpdateSwapOrder = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.UpdateSwapOrder> => {
  return eventData.action === TradingEventAction.UpdateSwapOrder;
};

export const isCancelSwapOrder = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.CancelSwapOrder> => {
  return eventData.action === TradingEventAction.CancelSwapOrder;
};
export const isCancelPosition = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CancelDecreasePosition
  | TradingEventAction.CancelIncreasePosition
> => {
  return (
    eventData.action === TradingEventAction.CancelDecreasePosition ||
    eventData.action === TradingEventAction.CancelIncreasePosition
  );
};
export const isCancelTradeOrder = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CancelDecreaseOrder
  | TradingEventAction.CancelIncreaseOrder
> => {
  return (
    eventData.action === TradingEventAction.CancelDecreaseOrder ||
    eventData.action === TradingEventAction.CancelIncreaseOrder
  );
};

export const isLiquidatePositionEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.LiquidatePosition> => {
  return eventData.action === TradingEventAction.LiquidatePosition;
};

export const isPartialLiquidationEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.PartialLiquidation> => {
  return eventData.action === TradingEventAction.PartialLiquidation;
};

export const isPositionEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateIncreasePosition
  | TradingEventAction.CreateDecreasePosition
  | TradingEventAction.ExecuteIncreasePosition
  | TradingEventAction.ExecuteDecreasePosition
> => {
  return (
    eventData.action === TradingEventAction.CreateIncreasePosition ||
    eventData.action === TradingEventAction.CreateDecreasePosition ||
    eventData.action === TradingEventAction.ExecuteIncreasePosition ||
    eventData.action === TradingEventAction.ExecuteDecreasePosition
  );
};

export const isPositionEventWithCancel = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<
  | TradingEventAction.CreateIncreasePosition
  | TradingEventAction.CreateDecreasePosition
  | TradingEventAction.ExecuteIncreasePosition
  | TradingEventAction.ExecuteDecreasePosition
  | TradingEventAction.CancelIncreasePosition
  | TradingEventAction.CancelDecreasePosition
> => {
  return [
    TradingEventAction.CreateIncreasePosition,
    TradingEventAction.CreateDecreasePosition,
    TradingEventAction.ExecuteIncreasePosition,
    TradingEventAction.ExecuteDecreasePosition,
    TradingEventAction.CancelIncreasePosition,
    TradingEventAction.CancelDecreasePosition,
  ].includes(eventData.action);
};

export const isExecuteDecreaseOrderEvent = (
  eventData: AnyTradingEvent
): eventData is TradingEvent<TradingEventAction.ExecuteDecreaseOrder> => {
  return eventData.action === TradingEventAction.ExecuteDecreaseOrder;
};

export const isWithDrawalEvent = (eventData: AnyTradingEvent) => {
  const _isPositionEvent = isPositionEvent(eventData);
  if (!_isPositionEvent) return false;

  const isSizeDeltaZero = BigNumber.from(eventData.paramsParsed.sizeDelta).eq(
    0
  );

  return isSizeDeltaZero && isDecreasePositionEvent(eventData);
};
export const isDepositEvent = (eventData: AnyTradingEvent) => {
  const _isPositionEvent = isPositionEvent(eventData);
  if (!_isPositionEvent) return false;

  const isSizeDeltaZero = BigNumber.from(eventData.paramsParsed.sizeDelta).eq(
    0
  );

  return isSizeDeltaZero && isIncreasePositionEvent(eventData);
};
export const isWithDrawalEventWithCancel = (eventData: AnyTradingEvent) => {
  const isPositionEvent = isPositionEventWithCancel(eventData);
  if (!isPositionEvent) return false;

  const isSizeDeltaZero = BigNumber.from(eventData.paramsParsed.sizeDelta).eq(
    0
  );

  return isSizeDeltaZero && isDecreasePositionEvent(eventData);
};
export const isDepositEventWithCancel = (eventData: AnyTradingEvent) => {
  const isPositionEvent = isPositionEventWithCancel(eventData);
  if (!isPositionEvent) return false;

  const isSizeDeltaZero = BigNumber.from(eventData.paramsParsed.sizeDelta).eq(
    0
  );

  return isSizeDeltaZero && isIncreasePositionEvent(eventData);
};

export const isCancelDepositOrWithdrawEvent = (eventData: AnyTradingEvent) => {
  return (
    isCancelPosition(eventData) &&
    (isDepositEventWithCancel(eventData) ||
      isWithDrawalEventWithCancel(eventData))
  );
};

export const isCancelPositionOrOrderEvent = (eventData: AnyTradingEvent) => {
  return (
    !isCancelDepositOrWithdrawEvent(eventData) &&
    (isCancelPosition(eventData) || isCancelTradeOrder(eventData))
  );
};

export const isExecutePositionEvent = (eventData: AnyTradingEvent) => {
  return (
    isExecuteIncreasePositionEvent(eventData) ||
    isExecuteDecreasePositionEvent(eventData)
  );
};

export const isTakeProfitEvent = (eventData: AnyTradingEvent) => {
  return (
    isDecreaseTradeOrderEvent(eventData) &&
    eventData.paramsParsed.isLong ===
      eventData.paramsParsed.triggerAboveThreshold
  );
};

export const isStopLossEvent = (eventData: AnyTradingEvent) => {
  return (
    isDecreaseTradeOrderEvent(eventData) &&
    eventData.paramsParsed.isLong !==
      eventData.paramsParsed.triggerAboveThreshold
  );
};
