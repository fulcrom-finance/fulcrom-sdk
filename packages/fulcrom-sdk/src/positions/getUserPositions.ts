import { Address, ChainId } from "../types";
import { WrapPosition, Position } from "../types/position";
import { getPositions } from "./getPositions";
import { getCalculatedPosition } from "./getCalculatedPosition";
import { getOrders } from "../orders/getOrders";
import {
  DecreaseOrder,
  IncreaseOrder,
  OrderType,
  TradeOrder,
} from "../query/graphql";
import { getOrdersForPosition } from "./getOrdersForPosition";
import { getIncreaseType } from "../orders/getCreatedOrderType";
import { CreatedOrderType } from "../types/order";
import { getOrdersWithPosition } from "../orders/getOrdersWithPosition";
import { TokenManager } from "../utils/tokenManager";

export async function getPositionList(
  account: Address,
  chainId: ChainId,
  tokenManager: TokenManager,
  caches: Map<string, any>
): Promise<WrapPosition[] | undefined> {
  const positions = await getPositions({ account, chainId, caches });
  const orders = await getOrders(account, chainId, caches);
  const { tradeOrders } = await getOrdersWithPosition({
    account,
    chainId,
    tokenManager,
    orders,
    positions,
    caches,
  });

  if (positions) {
    return Promise.all(
      positions.map(async (position) => {
        const openOrder = await buildOpenOrder(position, tradeOrders);
        const calculatedPosition = await getCalculatedPosition(
          position,
          chainId,
          caches
        );

        return {
          ...position,
          ...calculatedPosition,
          ...openOrder,
        };
      })
    );
  }
}

export const buildOpenOrder = async (
  position: Position,
  tradeOrders: TradeOrder[]
) => {
  const orders = getOrdersForPosition(position, tradeOrders ?? []);

  const increaseOrders: IncreaseOrder[] = [];
  let limitOrderCount = 0;
  let stopOrderCount = 0;

  const decreaseOrders: DecreaseOrder[] = [];

  for (const o of orders) {
    if (o.type === OrderType.IncreaseOrder) {
      increaseOrders.push(o);

      switch (getIncreaseType(o)) {
        case CreatedOrderType.Limit: {
          limitOrderCount++;
          break;
        }
        case CreatedOrderType.StopMarket: {
          stopOrderCount++;
          break;
        }
      }
    } else if (o.type === OrderType.DecreaseOrder) {
      decreaseOrders.push(o);
    }
  }

  return {
    orders: orders,
    orderCount: {
      limitOrderCount: limitOrderCount,
      stopOrderCount: stopOrderCount,
      slTpCount: decreaseOrders.length,
    },
  };
};
