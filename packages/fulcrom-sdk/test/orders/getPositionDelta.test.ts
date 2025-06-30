import { getPositionDelta } from "../../src/orders/getPositionDelta";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../src/config", () => ({
  MIN_PROFIT_TIME: 60, // 1 minute
  BASIS_POINTS_DIVISOR: 10000,
  MIN_PROFIT_BIPS: 50, // 0.5%
}));

const now = Math.floor(Date.now() / 1000);

describe("getPositionDelta", () => {
  it("should calculate profit for long position (minProfitExpired = true)", () => {
    const price = BigNumber.from(1200);
    const position = {
      size: BigNumber.from(1000),
      collateral: BigNumber.from(500),
      isLong: true,
      averagePrice: BigNumber.from(1000),
      lastIncreasedTime: now - 1000, // expired
    };
    const result = getPositionDelta(price, position);
    // Profit: (1200-1000)*1000/1000 = 200
    expect(result.hasProfit).toBe(true);
    expect(result.delta.eq(200)).toBe(true);
    expect(result.deltaPercentage.eq(200 * 10000 / 500)).toBe(true);
  });

  it("should calculate loss for long position", () => {
    const price = BigNumber.from(800);
    const position = {
      size: BigNumber.from(1000),
      collateral: BigNumber.from(500),
      isLong: true,
      averagePrice: BigNumber.from(1000),
      lastIncreasedTime: now - 1000,
    };
    const result = getPositionDelta(price, position);
    // Loss: (1000-800)*1000/1000 = 200
    expect(result.hasProfit).toBe(false);
    expect(result.delta.eq(200)).toBe(true);
    expect(result.deltaPercentage.eq(200 * 10000 / 500)).toBe(true);
  });

  it("should calculate profit for short position", () => {
    const price = BigNumber.from(800);
    const position = {
      size: BigNumber.from(1000),
      collateral: BigNumber.from(500),
      isLong: false,
      averagePrice: BigNumber.from(1000),
      lastIncreasedTime: now - 1000,
    };
    const result = getPositionDelta(price, position);
    // Profit: (1000-800)*1000/1000 = 200
    expect(result.hasProfit).toBe(true);
    expect(result.delta.eq(200)).toBe(true);
    expect(result.deltaPercentage.eq(200 * 10000 / 500)).toBe(true);
  });

  it("should set delta to 0 if minProfitExpired is false and profit is small", () => {
    const price = BigNumber.from(1005);
    const position = {
      size: BigNumber.from(1000),
      collateral: BigNumber.from(500),
      isLong: true,
      averagePrice: BigNumber.from(1000),
      lastIncreasedTime: now, // not expired
    };
    const result = getPositionDelta(price, position);
    // delta = (1005-1000)*1000/1000 = 5, but minProfit not expired and delta <= size*MIN_PROFIT_BIPS/BASIS_POINTS_DIVISOR
    expect(result.hasProfit).toBe(true);
    expect(result.delta.eq(0)).toBe(true);
  });

  it("should use sizeDelta if provided", () => {
    const price = BigNumber.from(1200);
    const position = {
      size: BigNumber.from(1000),
      collateral: BigNumber.from(500),
      isLong: true,
      averagePrice: BigNumber.from(1000),
      lastIncreasedTime: now - 1000,
    };
    const result = getPositionDelta(price, position, BigNumber.from(500));
    // Profit: (1200-1000)*500/1000 = 100
    expect(result.delta.eq(100)).toBe(true);
    expect(result.pendingDelta.eq(100)).toBe(true);
  });

  it("should handle averagePrice = 0", () => {
    const price = BigNumber.from(1000);
    const position = {
      size: BigNumber.from(1000),
      collateral: BigNumber.from(500),
      isLong: true,
      averagePrice: BigNumber.from(0),
      lastIncreasedTime: now - 1000,
    };
    const result = getPositionDelta(price, position);
    expect(result.delta.eq(0)).toBe(true);
    expect(result.pendingDelta.eq(0)).toBe(true);
  });

  it("should handle collateral = 0", () => {
    const price = BigNumber.from(1200);
    const position = {
      size: BigNumber.from(1000),
      collateral: BigNumber.from(0),
      isLong: true,
      averagePrice: BigNumber.from(1000),
      lastIncreasedTime: now - 1000,
    };
    const result = getPositionDelta(price, position);
    expect(result.deltaPercentage.eq(0)).toBe(true);
    expect(result.pendingDeltaPercentage.eq(0)).toBe(true);
  });
});
