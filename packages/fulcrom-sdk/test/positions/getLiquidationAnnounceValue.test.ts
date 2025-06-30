import { getLiquidationAnnounceValue } from "../../src/positions/getLiquidationAnnounceValue";
import { BigNumber } from "ethers";

describe("getLiquidationAnnounceValue", () => {
  const base = {
    collateral: BigNumber.from(1000),
    fundingFee: BigNumber.from(100),
    positionFee: BigNumber.from(50),
    pendingDelta: BigNumber.from(200),
  };

  it("returns correct value when hasProfit is true", () => {
    const position = {
      ...base,
      hasProfit: true,
    } as any;

    // 1000 + 200 - 100 - 50 = 1050
    const result = getLiquidationAnnounceValue(position);
    expect(result!.toString()).toBe("1050");
  });

  it("returns correct value when hasProfit is false", () => {
    const position = {
      ...base,
      hasProfit: false,
    } as any;

    // 1000 + (-200) - 100 - 50 = 650
    const result = getLiquidationAnnounceValue(position);
    expect(result!.toString()).toBe("650");
  });

  it("returns undefined if collateral is missing", () => {
    const position = {
      ...base,
      collateral: undefined,
      hasProfit: true,
    } as any;

    const result = getLiquidationAnnounceValue(position);
    expect(result).toBeUndefined();
  });

  it("returns undefined if pendingDelta is missing", () => {
    const position = {
      ...base,
      pendingDelta: undefined,
      hasProfit: true,
    } as any;

    const result = getLiquidationAnnounceValue(position);
    expect(result).toBeUndefined();
  });

  it("returns undefined if fundingFee is missing", () => {
    const position = {
      ...base,
      fundingFee: undefined,
      hasProfit: true,
    } as any;

    const result = getLiquidationAnnounceValue(position);
    expect(result).toBeUndefined();
  });

  it("returns undefined if positionFee is missing", () => {
    const position = {
      ...base,
      positionFee: undefined,
      hasProfit: true,
    } as any;

    const result = getLiquidationAnnounceValue(position);
    expect(result).toBeUndefined();
  });
});
