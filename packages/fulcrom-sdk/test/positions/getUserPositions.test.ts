import { getPositionList, buildOpenOrder } from "../../src/positions/getUserPositions";
import { OrderType } from "../../src/query/graphql";
import { CreatedOrderType } from "../../src/types/order";

jest.mock("../../src/positions/getPositions", () => ({
  getPositions: jest.fn(() => Promise.resolve([
    { id: 1, foo: "bar" },
    { id: 2, foo: "baz" },
  ])),
}));
jest.mock("../../src/positions/getCalculatedPosition", () => ({
  getCalculatedPosition: jest.fn(() => Promise.resolve({ calc: "ulated" })),
}));
jest.mock("../../src/orders/getOrders", () => ({
  getOrders: jest.fn(() => Promise.resolve([{ id: 10 }, { id: 20 }])),
}));
jest.mock("../../src/orders/getOrdersWithPosition", () => ({
  getOrdersWithPosition: jest.fn(() => Promise.resolve({ tradeOrders: [{ id: 100 }, { id: 200 }] })),
}));
jest.mock("../../src/positions/getOrdersForPosition", () => ({
  getOrdersForPosition: jest.fn(() => [
    { type: OrderType.IncreaseOrder, id: 100 },
    { type: OrderType.DecreaseOrder, id: 200 },
    { type: OrderType.IncreaseOrder, id: 101 },
  ]),
}));
jest.mock("../../src/orders/getCreatedOrderType", () => ({
  getIncreaseType: jest.fn((order) => {
    if (order.id === 100) return CreatedOrderType.Limit;
    if (order.id === 101) return CreatedOrderType.StopMarket;
    return undefined;
  }),
}));

describe("getPositionList", () => {
  const account = "0xabc";
  const chainId = 1 as any;
  const tokenManager = {} as any;
  const caches = new Map();

  it("returns merged positions with calculated and open order info", async () => {
    const result = await getPositionList(account, chainId, tokenManager, caches);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    for (const item of result!) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("calc", "ulated");
      expect(item).toHaveProperty("orders");
      expect(item).toHaveProperty("orderCount");
      expect(item.orderCount).toEqual({
        limitOrderCount: 1,
        stopOrderCount: 1,
        slTpCount: 1,
      });
    }
  });
});

describe("buildOpenOrder", () => {
  it("counts order types correctly", async () => {
    const position = { id: 1 } as any;
    const tradeOrders = [
      { type: OrderType.IncreaseOrder, id: 100 },
      { type: OrderType.DecreaseOrder, id: 200 },
      { type: OrderType.IncreaseOrder, id: 101 },
    ] as any;

    const result = await buildOpenOrder(position, tradeOrders);

    expect(result.orderCount).toEqual({
      limitOrderCount: 1,
      stopOrderCount: 1,
      slTpCount: 1,
    });
    expect(result.orders.length).toBe(3);
  });
});
