import { getOrderBook } from "../../../contracts/OrderBook";
import { isDecreaseOrder, isIncreaseOrder } from "../../../orders/getOrders";
import { Order } from "../../../query/graphql";
import { Address, ChainId } from "../../../types";
import { getProvider } from "../../../utils";

export const generateCancelOrdersTxData = async ({
  account,
  chainId,
  plugin,
  orders,
}: {
  account: Address;
  chainId: ChainId;
  plugin: Address;
  orders: Order[];
}) => {
  const signer = getProvider(chainId).getSigner();

  const orderBook = getOrderBook({
    signerOrProvider: signer,
    chainId,
  });
  const { swapOrderIndexes, increaseOrderIndexes, decreaseOrderIndexes } =
    getParams(orders);
  const data = orderBook.interface.encodeFunctionData("cancelMultiple", [
    swapOrderIndexes,
    increaseOrderIndexes,
    decreaseOrderIndexes,
  ]);

  return {
    override: {}, // keep empty otherwise sign failed
    to: plugin,
    from: account,
    data,
  };
};

const getParams = (orders: Order[]) => {
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
