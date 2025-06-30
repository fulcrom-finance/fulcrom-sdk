import { getIsNeedSwap } from "../../../src/trade/utils/getIsNeedSwap";

// Mock token with only address property, cast as any to satisfy type
const token = (address: string) => ({ address } as any);

describe("getIsNeedSwap", () => {
  it("returns false for long when fromToken.address == toTokenInfo.address", () => {
    const result = getIsNeedSwap({
      isLong: true,
      fromToken: token("0xabc"),
      toTokenInfo: token("0xabc"),
      collateralTokenInfo: token("0xdef"),
    });
    expect(result).toBe(false);
  });

  it("returns true for long when fromToken.address != toTokenInfo.address", () => {
    const result = getIsNeedSwap({
      isLong: true,
      fromToken: token("0xabc"),
      toTokenInfo: token("0xdef"),
      collateralTokenInfo: token("0xdef"),
    });
    expect(result).toBe(true);
  });

  it("returns false for short when fromToken.address == collateralTokenInfo.address", () => {
    const result = getIsNeedSwap({
      isLong: false,
      fromToken: token("0xabc"),
      toTokenInfo: token("0xdef"),
      collateralTokenInfo: token("0xabc"),
    });
    expect(result).toBe(false);
  });

  it("returns true for short when fromToken.address != collateralTokenInfo.address", () => {
    const result = getIsNeedSwap({
      isLong: false,
      fromToken: token("0xabc"),
      toTokenInfo: token("0xdef"),
      collateralTokenInfo: token("0xdef"),
    });
    expect(result).toBe(true);
  });

  it("returns false when all addresses are equal", () => {
    const resultLong = getIsNeedSwap({
      isLong: true,
      fromToken: token("0xaaa"),
      toTokenInfo: token("0xaaa"),
      collateralTokenInfo: token("0xaaa"),
    });
    const resultShort = getIsNeedSwap({
      isLong: false,
      fromToken: token("0xaaa"),
      toTokenInfo: token("0xaaa"),
      collateralTokenInfo: token("0xaaa"),
    });
    expect(resultLong).toBe(false);
    expect(resultShort).toBe(false);
  });

  it("returns true for long if fromToken != toTokenInfo, even if collateralTokenInfo is different", () => {
    const result = getIsNeedSwap({
      isLong: true,
      fromToken: token("0x1"),
      toTokenInfo: token("0x2"),
      collateralTokenInfo: token("0x3"),
    });
    expect(result).toBe(true);
  });

  it("returns true for short if fromToken != collateralTokenInfo, even if toTokenInfo is different", () => {
    const result = getIsNeedSwap({
      isLong: false,
      fromToken: token("0x1"),
      toTokenInfo: token("0x2"),
      collateralTokenInfo: token("0x3"),
    });
    expect(result).toBe(true);
  });
});
