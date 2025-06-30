import { getIsNeedSwap } from "../../../../src/trade/decrease/utils/getIsNeedSwap";

describe("getIsNeedSwap", () => {
  const tokenA = { address: "0x111" } as any;
  const tokenB = { address: "0x222" } as any;

  it("returns true for market order with different token addresses", () => {
    expect(
      getIsNeedSwap({
        isMarket: true,
        collateralToken: tokenA,
        receiveToken: tokenB,
      })
    ).toBe(true);
  });

  it("returns false for market order with same token addresses", () => {
    expect(
      getIsNeedSwap({
        isMarket: true,
        collateralToken: tokenA,
        receiveToken: tokenA,
      })
    ).toBe(false);
  });

  it("returns false for limit order with different token addresses", () => {
    expect(
      getIsNeedSwap({
        isMarket: false,
        collateralToken: tokenA,
        receiveToken: tokenB,
      })
    ).toBe(false);
  });

  it("returns false for limit order with same token addresses", () => {
    expect(
      getIsNeedSwap({
        isMarket: false,
        collateralToken: tokenA,
        receiveToken: tokenA,
      })
    ).toBe(false);
  });
});
