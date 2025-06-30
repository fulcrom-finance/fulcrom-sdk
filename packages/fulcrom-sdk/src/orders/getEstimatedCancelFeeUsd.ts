import { BigNumber } from "@ethersproject/bignumber";
import { cacheKeys, getDataWithCache } from "../cache";
import { getOrderBook } from "../contracts/OrderBook";
import { getGasPrice } from "../query/getGasPrice";
import { Order } from "../query/graphql";
import { getCancelOrderParams } from "../query/orders/getCancelOrderParams";
import { Address, CachesMap, ChainId } from "../types";
import { getPaymasterGasFeeQuery } from "../utils/getPaymasterGasFeeQuery";

export const getEstimatedCancelFeeUsd = async (
  {
    account,
    chainId,
    orders,
  }: {
    account: Address;
    chainId: ChainId;
    orders: Order[];
  },
  caches: CachesMap<BigNumber>
) => {
  const gasPrice = await getDataWithCache<BigNumber, [ChainId]>(
    caches,
    cacheKeys.GasPrice,
    getGasPrice,
    chainId
  );

  const { swapOrderIndexes, increaseOrderIndexes, decreaseOrderIndexes } =
    getCancelOrderParams({ orders });

  return getPaymasterGasFeeQuery({
    chainId,
    getContract: getOrderBook,
    functionName: "cancelMultiple",
    account,
    gasPrice,
    overrides: {},
    params: [swapOrderIndexes, increaseOrderIndexes, decreaseOrderIndexes],
  });
};
