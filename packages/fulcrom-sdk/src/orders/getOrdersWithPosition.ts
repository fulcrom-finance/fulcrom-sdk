import { getPositionKey } from "../positions/getPositionKey";
import { AllOrders, TradeOrder } from "../query/graphql";
import { Address, ChainId } from "../types";
import { Position } from "../types/position";
import { TokenManager } from "../utils/tokenManager";
import { getCollateral } from "./getCollateral";
import { getEstimatedCancelFeeUsd } from "./getEstimatedCancelFeeUsd";
import { getLeverageChange } from "./getLeverageChange";
import { getLiquidationPrice } from "./getLiquidationPrice";
import { getDecreaseOrderError, getIncreaseOrderError } from "./getOrderError";
import { getEntryPrice, getOrderMarketPrice } from "./getOrderMarketPrice";
import {  isIncreaseOrder } from "./getOrders";
import { getOrderWithPositionSize } from "./getOrderWithPositionSize";

export const getOrdersWithPosition = async ({
  account,
  chainId,
  tokenManager,
  orders,
  positions,
  caches,
}: {
  account: Address;
  chainId: ChainId;
  tokenManager: TokenManager;
  orders: AllOrders;
  positions?: Position[];
  caches: Map<string, any>;
}) => {
  const increaseOrders = await Promise.all(
    orders.increaseOrders.map(async (order) => {
      const positionKey = await getPositionKey({
        account: order.account,
        collateralTokenAddress: order.collateralToken,
        toToken: order.indexToken,
        isLong: order.isLong,
      });

      const existingPosition = positions?.find(
        (p) => p.size.gt(0) && p.key === positionKey
      );
      return getOrderWithPosition({
        account,
        chainId,
        tokenManager,
        order,
        position: existingPosition,
        caches,
      });
    })
  );

  const decreaseOrders = await Promise.all(
    orders.decreaseOrders.map(async (order) => {
      const positionKey = await getPositionKey({
        account: order.account,
        collateralTokenAddress: order.collateralToken,
        toToken: order.indexToken,
        isLong: order.isLong,
      });

      const existingPosition = positions?.find(
        (p) => p.size.gt(0) && p.key === positionKey
      );
      return getOrderWithPosition({
        account,
        chainId,
        tokenManager,
        order,
        position: existingPosition,
        caches,
      });
    })
  );

  return {
    swapOrder: orders.swapOrders,
    tradeOrders: [...increaseOrders, ...decreaseOrders].sort(
      (a, b) => b.timestamp - a.timestamp
    ),
  };
};

export const getOrderWithPosition = async ({
  account,
  chainId,
  tokenManager,
  order,
  position,
  caches,
}: {
  account: Address;
  chainId: ChainId;
  tokenManager: TokenManager;
  order: TradeOrder;
  position?: Position;
  caches: Map<string, any>;
}) => {
  const indexTokenInfo = tokenManager.getTokenByAddress(order.indexToken);
  const purchaseTokenInfo = isIncreaseOrder(order)
    ? tokenManager.getTokenByAddress(order.purchaseToken)
    : undefined;
  const collateralTokenInfo = tokenManager.getTokenByAddress(
    order.collateralToken
  );

  let orderValidation;
  if (isIncreaseOrder(order)) {
    if (indexTokenInfo && purchaseTokenInfo && collateralTokenInfo) {
      orderValidation = await getIncreaseOrderError({
        chainId,
        indexTokenInfo,
        purchaseTokenInfo,
        collateralTokenInfo,
        orderData: order,
        position,
        caches,
      });
    }
  } else if (indexTokenInfo && collateralTokenInfo) {
    orderValidation = await getDecreaseOrderError(order, position);
  }

  const price = getOrderMarketPrice({
    order,
    indexTokenInfo,
  });

  const entryPrice = getEntryPrice({
    order,
    position,
  });

  const liquidationPrice = await getLiquidationPrice({
    chainId,
    order,
    position,
    collateralTokenInfo,
    caches,
  });

  let leverage;
  if (indexTokenInfo && purchaseTokenInfo && collateralTokenInfo)
    leverage = await getLeverageChange(
      {
        chainId,
        order,
        position,
        indexTokenInfo,
        purchaseTokenInfo,
        collateralTokenInfo,
      },
      caches
    );
  const size = getOrderWithPositionSize(order, position);
  const collateral = collateralTokenInfo
    ? getCollateral({
        order,
        position,
        collateralTokenInfo,
      })
    : undefined;
  const estimatedCancelFee = await getEstimatedCancelFeeUsd(
    {
      account,
      chainId,
      orders: [order],
    },
    caches
  );

  return {
    ...order,
    // token infos
    indexTokenInfo,
    purchaseTokenInfo,
    collateralTokenInfo,

    // validate this order
    orderResult: orderValidation,
    marketPrice: price,
    // with some position data
    entryPrice: entryPrice,
    liquidationPrice: {
      from: liquidationPrice.from,
      to: liquidationPrice.to,
    },
    leverage: {
      from: leverage?.from,
      to: leverage?.to,
    },
    size,
    collateral,
    estimatedCancelFee,
  };
};
