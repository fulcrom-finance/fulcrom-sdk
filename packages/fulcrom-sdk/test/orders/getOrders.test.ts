import * as getOrdersModule from "../../src/orders/getOrders";
import { OrderType, IncreaseOrder, DecreaseOrder, SwapOrder } from "../../src/query/graphql";
import { CreatedOrderType } from "../../src/types/order";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../src/query/graphql", () => {
  const actual = jest.requireActual("../../src/query/graphql");
  return {
    ...actual,
    getOrdersGQL: jest.fn(() => ({
      tradeOrders: [{ id: "t1", type: 1 }],
      increaseOrders: [{ id: "i1", type: 1 }],
      decreaseOrders: [{ id: "d1", type: 2, indexToken: "A", collateralToken: "B", isLong: true, account: "0x", executionFee: BigNumber.from(0), sizeDelta: BigNumber.from(0), triggerPrice: BigNumber.from(0), triggerAboveThreshold: false, timestamp: 0 }],
      swapOrders: [{ id: "s1", type: 0 }],
    })),
    OrderType: actual.OrderType,
  };
});
jest.mock("../../src/types/order", () => {
  const actual = jest.requireActual("../../src/types/order");
  return {
    ...actual,
    CreatedOrderType: actual.CreatedOrderType
  };
});
jest.mock("../../src/orders/getCreatedOrderType", () => ({
  getCreatedOrderType: jest.fn((order) =>
    order.id === "d1" ? CreatedOrderType.StopLoss : CreatedOrderType.TakeProfit
  ),
}));

describe("getOrders module", () => {
  const account = "0xAccount";
  const chainId = 25;
  const caches = new Map();

  it("getOrders returns orders from getOrdersGQL", async () => {
    const result = await getOrdersModule.getOrders(account, chainId, caches);
    expect(result.increaseOrders[0].id).toBe("i1");
    expect(result.decreaseOrders[0].id).toBe("d1");
    expect(result.tradeOrders[0].id).toBe("t1");
    expect(result.swapOrders[0].id).toBe("s1");
  });

  it("getTradeOrders returns tradeOrders", async () => {
    const result = await getOrdersModule.getTradeOrders(chainId, account, caches);
    expect(result[0].id).toBe("t1");
  });

  it("getIncreaseOrders returns increaseOrders", async () => {
    const result = await getOrdersModule.getIncreaseOrders(chainId, account, caches);
    expect(result[0].id).toBe("i1");
  });

  it("getDecreaseOrders returns decreaseOrders", async () => {
    const result = await getOrdersModule.getDecreaseOrders(chainId, account, caches);
    expect(result[0].id).toBe("d1");
  });

  it("getSwapOrders returns swapOrders", async () => {
    const result = await getOrdersModule.getSwapOrders(chainId, account, caches);
    expect(result[0].id).toBe("s1");
  });

  it("getIncreaseOrdersMatchId filters by id", async () => {
    const result = await getOrdersModule.getIncreaseOrdersMatchId(account, chainId, "i1", caches);
    expect(result[0].id).toBe("i1");
  });

  it("getDecreaseOrdersMatchId filters by id", async () => {
    const result = await getOrdersModule.getDecreaseOrdersMatchId(account, chainId, "d1", caches);
    expect(result[0].id).toBe("d1");
  });

  it("getDecreaseOrdersMatch filters by indexToken/collateralToken/isLong", async () => {
    const result = await getOrdersModule.getDecreaseOrdersMatch(account, chainId, "A", "B", true, caches);
    expect(result[0].id).toBe("d1");
  });

  it("isIncreaseOrder returns true for IncreaseOrder", () => {
    const incOrder: IncreaseOrder = {
      type: OrderType.IncreaseOrder,
      id: "i",
      index: "1",
      account: "0x",
      isLong: true,
      executionFee: BigNumber.from(0),
      indexToken: "0x",
      purchaseToken: "0x",
      collateralToken: "0x",
      purchaseTokenAmount: BigNumber.from(0),
      sizeDelta: BigNumber.from(0),
      triggerPrice: BigNumber.from(0),
      triggerAboveThreshold: false,
      timestamp: 0,
      sl: BigNumber.from(0),
      tp: BigNumber.from(0),
      tpSlExecutionFee: BigNumber.from(0),
    };
    const decOrder: DecreaseOrder = {
      type: OrderType.DecreaseOrder,
      id: "d",
      index: "1",
      account: "0x",
      isLong: true,
      executionFee: BigNumber.from(0),
      sizeDelta: BigNumber.from(0),
      indexToken: "0x",
      collateralToken: "0x",
      collateralDelta: BigNumber.from(0),
      triggerPrice: BigNumber.from(0),
      triggerAboveThreshold: false,
      timestamp: 0,
    };
    expect(getOrdersModule.isIncreaseOrder(incOrder)).toBe(true);
    expect(getOrdersModule.isIncreaseOrder(decOrder)).toBe(false);
  });

  it("isDecreaseOrder returns true for DecreaseOrder", () => {
    const incOrder: IncreaseOrder = {
      type: OrderType.IncreaseOrder,
      id: "i",
      index: "1",
      account: "0x",
      isLong: true,
      executionFee: BigNumber.from(0),
      indexToken: "0x",
      purchaseToken: "0x",
      collateralToken: "0x",
      purchaseTokenAmount: BigNumber.from(0),
      sizeDelta: BigNumber.from(0),
      triggerPrice: BigNumber.from(0),
      triggerAboveThreshold: false,
      timestamp: 0,
      sl: BigNumber.from(0),
      tp: BigNumber.from(0),
      tpSlExecutionFee: BigNumber.from(0),
    };
    const decOrder: DecreaseOrder = {
      type: OrderType.DecreaseOrder,
      id: "d",
      index: "1",
      account: "0x",
      isLong: true,
      executionFee: BigNumber.from(0),
      sizeDelta: BigNumber.from(0),
      indexToken: "0x",
      collateralToken: "0x",
      collateralDelta: BigNumber.from(0),
      triggerPrice: BigNumber.from(0),
      triggerAboveThreshold: false,
      timestamp: 0,
    };
    expect(getOrdersModule.isDecreaseOrder(decOrder)).toBe(true);
    expect(getOrdersModule.isDecreaseOrder(incOrder)).toBe(false);
  });

  it("isSwapOrder returns true for SwapOrder", () => {
    const swapOrder: SwapOrder = {
      type: OrderType.SwapOrder,
      id: "s",
      index: "1",
      account: "0x",
      executionFee: BigNumber.from(0),
      amountIn: BigNumber.from(0),
      minOut: BigNumber.from(0),
      path: [],
      triggerRatio: BigNumber.from(0),
      triggerAboveThreshold: false,
      shouldUnwrap: false,
      timestamp: 0,
    };
    const incOrder: IncreaseOrder = {
      type: OrderType.IncreaseOrder,
      id: "i",
      index: "1",
      account: "0x",
      isLong: true,
      executionFee: BigNumber.from(0),
      indexToken: "0x",
      purchaseToken: "0x",
      collateralToken: "0x",
      purchaseTokenAmount: BigNumber.from(0),
      sizeDelta: BigNumber.from(0),
      triggerPrice: BigNumber.from(0),
      triggerAboveThreshold: false,
      timestamp: 0,
      sl: BigNumber.from(0),
      tp: BigNumber.from(0),
      tpSlExecutionFee: BigNumber.from(0),
    };
    expect(getOrdersModule.isSwapOrder(swapOrder)).toBe(true);
    expect(getOrdersModule.isSwapOrder(incOrder)).toBe(false);
  });

  it("getTakeProfitOrders returns only take profit orders", async () => {
    const result = await getOrdersModule.getTakeProfitOrders(chainId, account, caches);
    expect(result.length).toBe(0); // getCreatedOrderType returns StopLoss for d1
  });

  it("getStopLossOrders returns only stop loss orders", async () => {
    const result = await getOrdersModule.getStopLossOrders(chainId, account, caches);
    expect(result[0].id).toBe("d1");
  });

  it("isStopLossOrder returns true for stop loss", () => {
    expect(getOrdersModule.isStopLossOrder({ id: "d1" } as any)).toBe(true);
  });

  it("isTakeProfitOrder returns true for take profit", () => {
    expect(getOrdersModule.isTakeProfitOrder({ id: "notd1" } as any)).toBe(true);
  });

  it("getOrder returns correct order by id and type", async () => {
    const result = await getOrdersModule.getOrder({
      account,
      chainId,
      orderType: OrderType.IncreaseOrder,
      orderId: "i1",
      caches,
    });
    expect(result?.id).toBe("i1");
  });
});
