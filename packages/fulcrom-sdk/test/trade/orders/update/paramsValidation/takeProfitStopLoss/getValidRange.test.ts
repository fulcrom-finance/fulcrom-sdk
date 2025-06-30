import { getValidRange } from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getValidRange";

describe("getValidRange", () => {
  it("returns [entryPrice, null] for long take profit", () => {
    const entryPrice = BigInt("100");
    const liquidationPrice = BigInt("50");
    const result = getValidRange({
      entryPrice,
      isLong: true,
      liquidationPrice,
      isTakeProfit: true,
    });
    expect(result).toEqual([entryPrice, null]);
  });

  it("returns [liquidationPrice, entryPrice] for long stop loss", () => {
    const entryPrice = BigInt("100");
    const liquidationPrice = BigInt("50");
    const result = getValidRange({
      entryPrice,
      isLong: true,
      liquidationPrice,
      isTakeProfit: false,
    });
    expect(result).toEqual([liquidationPrice, entryPrice]);
  });

  it("returns [1n, entryPrice] for short take profit", () => {
    const entryPrice = BigInt("100");
    const liquidationPrice = BigInt("50");
    const result = getValidRange({
      entryPrice,
      isLong: false,
      liquidationPrice,
      isTakeProfit: true,
    });
    // Use BigInt("1") for consistency
    expect(result).toEqual([BigInt("1"), entryPrice]);
  });

  it("returns [entryPrice, liquidationPrice] for short stop loss", () => {
    const entryPrice = BigInt("100");
    const liquidationPrice = BigInt("50");
    const result = getValidRange({
      entryPrice,
      isLong: false,
      liquidationPrice,
      isTakeProfit: false,
    });
    expect(result).toEqual(null);
  });

  it("returns null if min > max", () => {
    // For long stop loss: [liquidationPrice, entryPrice], so set liquidationPrice > entryPrice
    const entryPrice = BigInt("50");
    const liquidationPrice = BigInt("100");
    const result = getValidRange({
      entryPrice,
      isLong: true,
      liquidationPrice,
      isTakeProfit: false,
    });
    expect(result).toBeNull();
  });

  it("returns [1n, max] if min < 1", () => {
    // For short stop loss: [entryPrice, liquidationPrice], entryPrice < 1
    const entryPrice = BigInt("0");
    const liquidationPrice = BigInt("100");
    const result = getValidRange({
      entryPrice,
      isLong: false,
      liquidationPrice,
      isTakeProfit: false,
    });
    // Use BigInt("1") for consistency
    expect(result).toEqual([BigInt("1"), liquidationPrice]);
  });

  it("returns [1n, null] if min < 1 and max is null", () => {
    // For long take profit: [entryPrice, null], entryPrice < 1
    const entryPrice = BigInt("0");
    const liquidationPrice = BigInt("100");
    const result = getValidRange({
      entryPrice,
      isLong: true,
      liquidationPrice,
      isTakeProfit: true,
    });
    // Use BigInt("1") for consistency
    expect(result).toEqual([BigInt("1"), null]);
  });
});
