import { Address } from "./alias";
import { BigNumber } from "@ethersproject/bignumber";
import { Orders } from "./order";
import { TradeOrder } from "../query/graphql";
export type PositionKey = string;

export type RawPosition = {
  // a generated unique position key
  key: PositionKey;
  collateralToken: Address;
  indexToken: Address;
  isLong: boolean;

  size: BigNumber;
  collateral: BigNumber;
  averagePrice: BigNumber;
  entryFundingRate: BigNumber;
  hasRealisedProfit: boolean;
  realisedPnl: BigNumber;
  lastIncreasedTime: number;
  hasProfit: boolean;
  delta: BigNumber;
};
export type BigIntPosition = {
  key: PositionKey;
  collateralToken: Address;
  indexToken: Address;
  isLong: boolean;

  size: bigint;
  collateral: bigint;
  averagePrice: bigint;
  entryFundingRate: bigint;
  hasRealisedProfit: boolean;
  realisedPnl: bigint;
  lastIncreasedTime: number;
  hasProfit: boolean;
  delta: bigint;
};

export type Position = RawPosition & {
  cumulativeFundingRate: BigNumber;
  fundingFee: BigNumber;
  collateralAfterFee: BigNumber;
  closingFee: BigNumber;
  positionFee: BigNumber;
  totalFees: BigNumber;
  pendingDelta: BigNumber;
  hasLowCollateral: boolean;
  markPrice: BigNumber;
  deltaPercentage: BigNumber;
  hasProfitAfterFees: boolean;
  /** pnl percentage */
  pendingDeltaAfterFees: BigNumber;
  deltaPercentageAfterFees: BigNumber;
  netValue: BigNumber;
  netValueAfterFees: BigNumber;
  //   hasPendingChange: boolean;
  leverage: BigNumber;
  liqPrice: BigNumber;
};

export type CalculatedPosition = {
  deltaBeforeFeesStr: string;
  deltaBeforeFeesPercentageStr: string;
  deltaAfterFeesStr: string;
  deltaAfterFeesPercentageStr: string;
  liquidationAnnounceValue: string | undefined;
  borrowFeeRate: string | undefined;
};

// open order count
export type OrderCount = {
  limitOrderCount: number;
  stopOrderCount: number;
  slTpCount: number;
};

// open order
export type OpenOrder = {
  orderCount: OrderCount;
  orders: TradeOrder[]; // from the open order endpoint
};

// warp position and it consist of position ,open order and calculated fields based on position
export type WrapPosition = Position & OpenOrder & CalculatedPosition;
