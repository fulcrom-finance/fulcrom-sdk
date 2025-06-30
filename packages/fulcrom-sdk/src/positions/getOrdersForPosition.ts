import { DecreaseOrder, IncreaseOrder } from '../query/graphql';
import { Position } from '../types/position';

export const getOrdersForPosition = (
  position: Pick<Position, 'indexToken' | 'isLong' | 'collateralToken'>,
  orders: (DecreaseOrder | IncreaseOrder)[],
): (DecreaseOrder | IncreaseOrder)[] => {
  if (orders.length === 0) return [];

  return orders.filter((order) => {
    const hasMatchingIndexToken = order.indexToken === position.indexToken;

    const hasMatchingCollateralToken =
      order.collateralToken === position.collateralToken;

    return (
      order.isLong === position.isLong &&
      hasMatchingIndexToken &&
      hasMatchingCollateralToken
    );
  });
};

export const getDecreaseOrdersForPosition = (
  position: Pick<Position, 'indexToken' | 'isLong' | 'collateralToken'>,
  orders: DecreaseOrder[],
): DecreaseOrder[] => getOrdersForPosition(position, orders) as DecreaseOrder[];
