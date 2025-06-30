import { BigNumber } from "@ethersproject/bignumber";
import { Address, ChainId, StringNumber } from "../../types";
import { getOrdersQuery, GetOrdersQueryOpts } from "../gql";
import { getTradesGraphUrl } from "../../config/api";
import { getCommonOptions } from "./commonOptions";
import { isIndexToken } from "../../config";
export enum OrderType {
  SwapOrder = "SwapOrder",
  IncreaseOrder = "IncreaseOrder",
  DecreaseOrder = "DecreaseOrder",
}

type _SwapOrder = {
  id: string;
  index: string;
  account: Address;

  executionFee: string;
  amountIn: string;
  minOut: string;
  path: string[];
  triggerRatio: string;
  triggerAboveThreshold: boolean;
  shouldUnwrap: boolean;

  timestamp: number;
};

export type SwapOrder = {
  type: OrderType.SwapOrder;
  id: string;
  index: string;
  account: Address;

  executionFee: BigNumber;
  amountIn: BigNumber;
  minOut: BigNumber;
  path: string[];
  triggerRatio: BigNumber;
  triggerAboveThreshold: boolean;
  shouldUnwrap: boolean;

  timestamp: number;
};

type _IncreaseOrder = {
  id: string;
  index: string;
  account: Address;

  isLong: boolean;
  executionFee: string;
  indexToken: Address;
  purchaseToken: Address;
  collateralToken: Address;
  purchaseTokenAmount: string;
  sizeDelta: string;
  triggerPrice: string;
  triggerAboveThreshold: boolean;

  timestamp: number;

  sl: StringNumber;
  tp: StringNumber;
  tpSlExecutionFee: StringNumber;
};

export type IncreaseOrder = {
  type: OrderType.IncreaseOrder;
  id: string;
  index: string;
  account: Address;

  isLong: boolean;
  executionFee: BigNumber;

  indexToken: Address;
  purchaseToken: Address;
  collateralToken: Address;
  purchaseTokenAmount: BigNumber;
  sizeDelta: BigNumber;
  triggerPrice: BigNumber;
  triggerAboveThreshold: boolean;

  timestamp: number;

  sl: BigNumber;
  tp: BigNumber;
  tpSlExecutionFee: BigNumber;
};

type _DecreaseOrder = {
  id: string;
  index: string;
  account: Address;

  isLong: boolean;
  executionFee: string;
  sizeDelta: string;
  indexToken: Address;
  collateralToken: Address;
  collateralDelta: string;
  triggerPrice: string;
  triggerAboveThreshold: boolean;

  timestamp: number;
};

export type DecreaseOrder = {
  type: OrderType.DecreaseOrder;
  id: string;
  index: string;
  account: Address;

  isLong: boolean;
  executionFee: BigNumber;
  sizeDelta: BigNumber;
  indexToken: Address;
  collateralToken: Address;
  collateralDelta: BigNumber;
  triggerPrice: BigNumber;
  triggerAboveThreshold: boolean;

  timestamp: number;
};

export type TradeOrder = IncreaseOrder | DecreaseOrder;
export type Order = IncreaseOrder | DecreaseOrder | SwapOrder;

export type AllOrders = {
  swapOrders: SwapOrder[];
  increaseOrders: IncreaseOrder[];
  decreaseOrders: DecreaseOrder[];
  tradeOrders: TradeOrder[];
};

type Response = {
  data: {
    swapOrders: _SwapOrder[];
    increaseOrders: _IncreaseOrder[];
    decreaseOrders: _DecreaseOrder[];
  };
};

export const getOrdersGQL = async (
  account: Address,
  chainId: ChainId,
  opts?: Omit<GetOrdersQueryOpts, "account">
) => {
  const query = getOrdersQuery({ ...opts, account });
  const res = await fetch(getTradesGraphUrl(chainId), getCommonOptions(query));

  const { data } = (await res.json()) as Response;

  // CRO is not in the Fulcrom index pool. CRO orders are considered as dirty data.
  // We need to filter out the dirty data.

  const swapOrders = data.swapOrders
    // filter out dirty orders
    .filter((order) => order.path.every((path) => isIndexToken(path, chainId)))
    .map<SwapOrder>(
      ({ executionFee, amountIn, minOut, triggerRatio, ...rest }) => ({
        type: OrderType.SwapOrder,
        executionFee: BigNumber.from(executionFee),
        amountIn: BigNumber.from(amountIn),
        minOut: BigNumber.from(minOut),
        triggerRatio: BigNumber.from(triggerRatio),
        ...rest,
      })
    );

  const increaseOrders = data.increaseOrders
    // filter out dirty orders
    .filter(
      (order) =>
        isIndexToken(order.indexToken, chainId) &&
        isIndexToken(order.collateralToken, chainId)
    )
    .map<IncreaseOrder>(
      ({
        executionFee,
        sizeDelta,
        triggerPrice,
        purchaseTokenAmount,
        tp,
        sl,
        tpSlExecutionFee,
        ...rest
      }) => ({
        type: OrderType.IncreaseOrder,
        executionFee: BigNumber.from(executionFee),
        sizeDelta: BigNumber.from(sizeDelta),
        triggerPrice: BigNumber.from(triggerPrice),
        purchaseTokenAmount: BigNumber.from(purchaseTokenAmount),
        tp: BigNumber.from(tp),
        sl: BigNumber.from(sl),
        tpSlExecutionFee: BigNumber.from(tpSlExecutionFee),
        ...rest,
      })
    );

  const decreaseOrders = data.decreaseOrders
    // filter out dirty orders
    .filter(
      (order) =>
        isIndexToken(order.indexToken, chainId) &&
        isIndexToken(order.collateralToken, chainId)
    )
    .map<DecreaseOrder>(
      ({
        executionFee,
        triggerPrice,
        collateralDelta,
        sizeDelta,
        ...rest
      }) => ({
        type: OrderType.DecreaseOrder,
        executionFee: BigNumber.from(executionFee),
        collateralDelta: BigNumber.from(collateralDelta),
        triggerPrice: BigNumber.from(triggerPrice),
        sizeDelta: BigNumber.from(sizeDelta),
        ...rest,
      })
    );

  // sort order by timestamp
  const tradeOrders = [...increaseOrders, ...decreaseOrders].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return {
    swapOrders,
    increaseOrders,
    decreaseOrders,
    tradeOrders,
  };
};
