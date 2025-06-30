import { Address } from "../../../types";

/**
 * list corresponding relation with the ful code
 * @see https://github.com/ful-io/ful-interface/blob/master/src/components/Exchange/TradeHistory.js#L139
 */
export enum TradingEventAction {
  // CreateIncreasePosition
  CreateIncreasePosition = "CreateIncreasePosition",

  // IncreasePosition-Long | IncreasePosition-Short
  ExecuteIncreasePosition = "ExecuteIncreasePosition",

  // CancelIncreasePosition
  CancelIncreasePosition = "CancelIncreasePosition",

  // CreateDecreasePosition
  CreateDecreasePosition = "CreateDecreasePosition",

  // DecreasePosition-Long | DecreasePosition-Short
  ExecuteDecreasePosition = "ExecuteDecreasePosition",

  // CancelDecreasePosition
  CancelDecreasePosition = "CancelDecreasePosition",

  // CreateIncreaseOrder
  CreateIncreaseOrder = "CreateIncreaseOrder",

  // UpdateIncreaseOrder
  UpdateIncreaseOrder = "UpdateIncreaseOrder",

  // ExecuteIncreaseOrder
  ExecuteIncreaseOrder = "ExecuteIncreaseOrder",

  // CancelIncreaseOrder
  CancelIncreaseOrder = "CancelIncreaseOrder",

  // CreateDecreaseOrder
  CreateDecreaseOrder = "CreateDecreaseOrder",

  // UpdateDecreaseOrder
  UpdateDecreaseOrder = "UpdateDecreaseOrder",

  // ExecuteDecreaseOrder
  ExecuteDecreaseOrder = "ExecuteDecreaseOrder",

  // CancelDecreaseOrder
  CancelDecreaseOrder = "CancelDecreaseOrder",

  // CreateSwapOrder
  CreateSwapOrder = "CreateSwapOrder",

  // UpdateSwapOrder
  UpdateSwapOrder = "UpdateSwapOrder",

  // ExecuteSwapOrder
  ExecuteSwapOrder = "ExecuteSwapOrder",

  // CancelSwapOrder
  CancelSwapOrder = "CancelSwapOrder",

  // Swap | SellUSDG | BuyUSDG
  Swap = "Swap",

  // LiquidatePosition-Long | LiquidatePosition-Short
  LiquidatePosition = "LiquidatePosition",

  // PartialLiquidation
  PartialLiquidation = "PartialLiquidation",
}

export type TradingEvent<A extends TradingEventAction> = {
  id: string;
  action: A;
  account: Address;
  txhash: string;
  timestamp: number;
  params: string;
};

export type Response<A extends TradingEventAction> = {
  data: {
    tradingEvents: TradingEvent<A>[];
  };
};
