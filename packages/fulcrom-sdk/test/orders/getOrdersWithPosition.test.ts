import { getOrdersWithPosition, getOrderWithPosition } from "../../src/orders/getOrdersWithPosition";
import { BigNumber } from "@ethersproject/bignumber";
import { OrderType } from "../../src/query/graphql";

jest.mock("../../src/positions/getPositionKey", () => ({
  getPositionKey: jest.fn(async () => "mocked_position_key"),
}));

const mockTokenManager = {
  getTokenByAddress: jest.fn(() => ({ symbol: "MOCK" })),
};

describe("getOrdersWithPosition", () => {
  beforeEach(() => {
    jest.spyOn(require("../../src/orders/getOrdersWithPosition"), "getOrderWithPosition").mockImplementation(async (...args: any[]) => {
      const { order } = args[0];
      return {
        ...order,
        mockPosition: true,
        timestamp: order.timestamp || 0,
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return tradeOrders and swapOrder with correct structure", async () => {
    const increaseOrder = {
      id: "inc1",
      account: "0x1",
      collateralToken: "0xct",
      indexToken: "0xit",
      isLong: true,
      timestamp: 2,
      type: OrderType.IncreaseOrder as any,
      index: "0",
      executionFee: BigNumber.from(0),
      purchaseToken: "0xp",
      purchaseTokenAmount: BigNumber.from(0),
      sizeDelta: BigNumber.from(0),
      triggerPrice: BigNumber.from(0),
      triggerAboveThreshold: false,
      sl: BigNumber.from(0),
      tp: BigNumber.from(0),
      tpSlExecutionFee: BigNumber.from(0),
    };
    const decreaseOrder = {
      id: "dec1",
      account: "0x1",
      collateralToken: "0xct",
      indexToken: "0xit",
      isLong: true,
      timestamp: 1,
      type: OrderType.DecreaseOrder as any,
      index: "0",
      executionFee: BigNumber.from(0),
      sizeDelta: BigNumber.from(0),
      collateralDelta: BigNumber.from(0),
      triggerPrice: BigNumber.from(0),
      triggerAboveThreshold: false,
    };
    const swapOrder = {
      id: "swap1",
      account: "0x1",
      collateralToken: "0xct",
      indexToken: "0xit",
      isLong: true,
      timestamp: 3,
      type: OrderType.SwapOrder as any,
      index: "0",
      executionFee: BigNumber.from(0),
      amountIn: BigNumber.from(0),
      minOut: BigNumber.from(0),
      path: [],
      triggerRatio: BigNumber.from(0),
      triggerAboveThreshold: false,
      shouldUnwrap: false,
    };

    const orders = {
      increaseOrders: [increaseOrder],
      decreaseOrders: [decreaseOrder],
      swapOrders: [swapOrder],
      tradeOrders: [],
    };

    const result = await getOrdersWithPosition({
      account: "0x1",
      chainId: 1 as any, // Cast to any to satisfy ChainId type
      tokenManager: mockTokenManager as any,
      orders,
      positions: [],
      caches: new Map(),
    });

    expect(result).toHaveProperty("tradeOrders");
    expect(result).toHaveProperty("swapOrder");
    expect(Array.isArray(result.tradeOrders)).toBe(true);
    expect(Array.isArray(result.swapOrder)).toBe(true);
    expect(result.tradeOrders.length).toBe(2);
    expect(result.swapOrder.length).toBe(1);
    // Sorted by timestamp descending
    expect((result.tradeOrders as any)[0].id).toBe("inc1");
    expect((result.tradeOrders as any)[1].id).toBe("dec1");
    expect((result.swapOrder as any)[0].id).toBe("swap1");
    // Check that mockPosition is attached
    expect((result.tradeOrders as any)[0].mockPosition).toBe(true);
    expect((result.tradeOrders as any)[1].mockPosition).toBe(true);
  });
});
