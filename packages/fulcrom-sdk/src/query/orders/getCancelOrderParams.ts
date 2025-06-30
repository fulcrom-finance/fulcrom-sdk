import { isIncreaseOrder, isDecreaseOrder } from "../../orders/getOrders";
import { Order } from "../graphql";

export const getCancelOrderParams = ({ orders }: { orders: Order[] }) => {
  const swapOrderIndexes: string[] = [];
  const increaseOrderIndexes: string[] = [];
  const decreaseOrderIndexes: string[] = [];

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    if (isIncreaseOrder(order)) {
      increaseOrderIndexes.push(order.index);
    } else if (isDecreaseOrder(order)) {
      decreaseOrderIndexes.push(order.index);
    } else {
      swapOrderIndexes.push(order.index);
    }
  }

  return {
    swapOrderIndexes,
    increaseOrderIndexes,
    decreaseOrderIndexes,
  };
};
