import { getOrderWithPositionSize } from "../../src/orders/getOrderWithPositionSize";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../src/orders/getOrders", () => ({
  isIncreaseOrder: jest.fn(),
}));

const { isIncreaseOrder } = require("../../src/orders/getOrders");

describe("getOrderWithPositionSize", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate next size for increase order with position", () => {
    isIncreaseOrder.mockReturnValue(true);
    const order = { sizeDelta: BigNumber.from(5) };
    const position = { size: BigNumber.from(10) };
    const result = getOrderWithPositionSize(order as any, position as any);
    expect(result.from).toBeDefined();
    expect(result.from!.eq(10)).toBe(true);
    expect(result.to.eq(15)).toBe(true);
  });

  it("should calculate next size for increase order without position", () => {
    isIncreaseOrder.mockReturnValue(true);
    const order = { sizeDelta: BigNumber.from(7) };
    const result = getOrderWithPositionSize(order as any, undefined);
    expect(result.from).toBeUndefined();
    expect(result.to.eq(7)).toBe(true);
  });

  it("should calculate next size for decrease order with position, not below zero", () => {
    isIncreaseOrder.mockReturnValue(false);
    const order = { sizeDelta: BigNumber.from(8) };
    const position = { size: BigNumber.from(5) };
    const result = getOrderWithPositionSize(order as any, position as any);
    expect(result.from).toBeDefined();
    expect(result.from!.eq(5)).toBe(true);
    expect(result.to.eq(0)).toBe(true);
  });

  it("should calculate next size for decrease order with position, positive result", () => {
    isIncreaseOrder.mockReturnValue(false);
    const order = { sizeDelta: BigNumber.from(3) };
    const position = { size: BigNumber.from(10) };
    const result = getOrderWithPositionSize(order as any, position as any);
    expect(result.from).toBeDefined();
    expect(result.from!.eq(10)).toBe(true);
    expect(result.to.eq(7)).toBe(true);
  });

  it("should calculate next size for decrease order without position", () => {
    isIncreaseOrder.mockReturnValue(false);
    const order = { sizeDelta: BigNumber.from(4) };
    const result = getOrderWithPositionSize(order as any, undefined);
    expect(result.from).toBeUndefined();
    expect(result.to.eq(0)).toBe(true);
  });
});
