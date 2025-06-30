import { BigNumber } from "@ethersproject/bignumber";
import { getEntryPrice } from "../../../src/trade/utils/entryPrice";
import { OrderType } from "../../../src/trade/orders/types/orderType";

describe("getEntryPrice", () => {
  // Minimal mock for Token type, cast as Token
  const toToken = {
    maxPrice: BigNumber.from(1000),
    minPrice: BigNumber.from(900),
  } as unknown as import("../../../src/types/token").Token;

  it("returns maxPrice for Market order and isLong true", () => {
    const result = getEntryPrice(toToken as any, BigNumber.from(1234), OrderType.Market, true);
    expect(result.eq((toToken as any).maxPrice)).toBe(true);
  });

  it("returns minPrice for Market order and isLong false", () => {
    const result = getEntryPrice(toToken as any, BigNumber.from(1234), OrderType.Market, false);
    expect(result.eq((toToken as any).minPrice)).toBe(true);
  });

  it("returns triggerPrice for Limit order", () => {
    const triggerPrice = BigNumber.from(1234);
    const result = getEntryPrice(toToken as any, triggerPrice, OrderType.Limit, true);
    expect(result.eq(triggerPrice)).toBe(true);
  });

  it("returns triggerPrice for StopMarket order", () => {
    const triggerPrice = BigNumber.from(5678);
    const result = getEntryPrice(toToken as any, triggerPrice, OrderType.StopMarket, false);
    expect(result.eq(triggerPrice)).toBe(true);
  });
});
