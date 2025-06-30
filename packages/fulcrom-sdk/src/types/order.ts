import { BigNumber } from "@ethersproject/bignumber";
import { DecreaseOrder, IncreaseOrder, SwapOrder } from "../query/graphql";
import { TokenInfo } from "./tokens";
import { PayGasToken } from "./token";

// for created orders that listed in contract
export enum CreatedOrderType {
  // increase
  Limit = "Limit",
  StopMarket = "StopMarket",

  // decrease
  TakeProfit = "TakeProfit",
  StopLoss = "StopLoss",
}

export type EstimatedCancelFee = {
  isNativeGas: boolean;
  gasToken: PayGasToken;
  gasTokenAmount: BigNumber;
};

// it just wwite here, and need to move to order dir
export type Orders = {
  swapOrders: SwapOrder[];
  increaseOrders: IncreaseOrderWithPosition[];
  decreaseOrders: DecreaseOrderWithPosition[];
  tradeOrders: (IncreaseOrderWithPosition | DecreaseOrderWithPosition)[];
};

export type IncreaseOrderWithPosition = {
  indexTokenInfo: TokenInfo;
  purchaseTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;

  // validate this order
  orderResult: string;
  // with some position data
  entryPrice: BigNumber;
  liquidationPrice: {
    from: BigNumber;
    to: BigNumber;
  };
  leverage: {
    from: BigNumber;
    to: BigNumber;
  };
  size: {
    from: BigNumber;
    to: BigNumber;
  };
  collateral: {
    from: BigNumber;
    to: BigNumber;
  };
  estimatedCancelFee: EstimatedCancelFee[];
} & IncreaseOrder;

export type DecreaseOrderWithPosition = {
  indexTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;

  // validate this order
  orderResult: string;
  // with some position data
  entryPrice: BigNumber;
  liquidationPrice: {
    from: BigNumber;
    to: BigNumber;
  };
  leverage: {
    from: BigNumber;
    to: BigNumber;
  };
  size: {
    from: BigNumber;
    to: BigNumber;
  };
  collateral: {
    from: BigNumber;
    to: BigNumber;
  };
  estimatedCancelFee: EstimatedCancelFee[];
} & DecreaseOrder;

export type FilterKey = {
  key: string;
  category?: string;
};
