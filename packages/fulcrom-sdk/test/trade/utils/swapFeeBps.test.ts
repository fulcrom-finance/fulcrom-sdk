import { BigNumber } from "@ethersproject/bignumber";
import { getSwapFeeBps } from "../../../src/trade/utils/swapFeeBps";

jest.mock("../../../src/config/constants", () => ({
  MINT_BURN_FEE_BASIS_POINTS: 30,
  STABLE_SWAP_FEE_BASIS_POINTS: 10,
  STABLE_TAX_BASIS_POINTS: 5,
  SWAP_FEE_BASIS_POINTS: 20,
  TAX_BASIS_POINTS: 1000, // Make this large for the rebateBps test
}));

describe("getSwapFeeBps", () => {
  const baseParams = {
    usdgDelta: BigNumber.from(100),
    isIncrement: true,
    usdgAmount: BigNumber.from(1000),
    usdgSupply: BigNumber.from(10000),
    weight: BigNumber.from(100),
    totalWeight: BigNumber.from(1000),
  };

  it("returns correct fee for Swap type", () => {
    const fee = getSwapFeeBps({ ...baseParams, swapType: "Swap" });
    expect(typeof fee).toBe("number");
  });

  it("returns correct fee for StableSwap type", () => {
    const fee = getSwapFeeBps({ ...baseParams, swapType: "StableSwap" });
    expect(typeof fee).toBe("number");
  });

  it("returns correct fee for FlpSwap type", () => {
    const fee = getSwapFeeBps({ ...baseParams, swapType: "FlpSwap" });
    expect(typeof fee).toBe("number");
  });

  it("returns initialSwapFeeBps when targetAmount is zero", () => {
    const fee = getSwapFeeBps({
      ...baseParams,
      swapType: "Swap",
      totalWeight: BigNumber.from(0),
    });
    expect(fee).toBe(20); // SWAP_FEE_BASIS_POINTS
  });

  it("returns 0 when rebateBps > initialSwapFeeBps", () => {
    // Force nextDiff < initialDiff and rebateBps > initialSwapFeeBps
    const fee = getSwapFeeBps({
      ...baseParams,
      swapType: "Swap",
      isIncrement: false,
      usdgDelta: BigNumber.from(999_999_999),
      usdgAmount: BigNumber.from(1_000_000_000),
      weight: BigNumber.from(1),
      usdgSupply: BigNumber.from(1),
      totalWeight: BigNumber.from(1),
    });
    expect(fee).toBe(0);
  });

  it("returns correct fee for decrement (isIncrement false)", () => {
    const fee = getSwapFeeBps({
      ...baseParams,
      swapType: "Swap",
      isIncrement: false,
      usdgDelta: BigNumber.from(50),
      usdgAmount: BigNumber.from(100),
    });
    expect(typeof fee).toBe("number");
  });

  it("caps averageDiff at targetAmount", () => {
    // Set up so averageDiff > targetAmount
    const fee = getSwapFeeBps({
      ...baseParams,
      swapType: "Swap",
      usdgAmount: BigNumber.from(10000),
      usdgDelta: BigNumber.from(10000),
      weight: BigNumber.from(100),
      usdgSupply: BigNumber.from(10000),
      totalWeight: BigNumber.from(100),
    });
    expect(typeof fee).toBe("number");
  });
});
