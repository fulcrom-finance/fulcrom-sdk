import { BigNumber } from "@ethersproject/bignumber";
import { getMaxSwapFeeBps } from "../../../src/trade/utils/maxSwapFeeBps";
import * as adjustDecimalsModule from "../../../src/utils/numbers/adjustDecimals";
import * as swapFeeBpsModule from "../../../src/trade/utils/swapFeeBps";

const mockToken = (overrides = {}) => ({
  address: "0x1",
  isStable: false,
  minPrice: BigNumber.from(1),
  decimals: 18,
  usdgAmount: BigNumber.from(0),
  weight: BigNumber.from(0),
  name: "MockToken",
  image: "",
  symbol: "MOCK",
  displayDecimals: 18,
  isNative: false,
  isShortable: false,
  isWrapped: false,
  isStablecoin: false,
  ...overrides,
} as any);

describe("getMaxSwapFeeBps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 0 if fromTokenInfo.address === toTokenInfo.address", () => {
    const fromToken = mockToken({ address: "0xabc" });
    const toToken = mockToken({ address: "0xabc" });
    const result = getMaxSwapFeeBps({
      fromAmount: BigNumber.from(100),
      fromTokenInfo: fromToken,
      toTokenInfo: toToken,
      usdgSupply: BigNumber.from(0),
      totalWeight: BigNumber.from(0),
    });
    expect(result).toBe(0);
  });

  it("returns 0 if fromAmount is not greater than 0", () => {
    const fromToken = mockToken({ address: "0xabc" });
    const toToken = mockToken({ address: "0xdef" });
    const result = getMaxSwapFeeBps({
      fromAmount: BigNumber.from(0),
      fromTokenInfo: fromToken,
      toTokenInfo: toToken,
      usdgSupply: BigNumber.from(0),
      totalWeight: BigNumber.from(0),
    });
    expect(result).toBe(0);
  });

  it("returns max fee for stable swap", () => {
    jest.spyOn(adjustDecimalsModule, "adjustDecimals").mockReturnValue(BigNumber.from(10));
    jest.spyOn(swapFeeBpsModule, "getSwapFeeBps")
      .mockReturnValueOnce(30)
      .mockReturnValueOnce(40);

    const fromToken = mockToken({ address: "0xabc", isStable: true });
    const toToken = mockToken({ address: "0xdef", isStable: true });
    const result = getMaxSwapFeeBps({
      fromAmount: BigNumber.from(100),
      fromTokenInfo: fromToken,
      toTokenInfo: toToken,
      usdgSupply: BigNumber.from(0),
      totalWeight: BigNumber.from(0),
    });
    expect(result).toBe(40);
  });

  it("returns max fee for non-stable swap", () => {
    jest.spyOn(adjustDecimalsModule, "adjustDecimals").mockReturnValue(BigNumber.from(20));
    jest.spyOn(swapFeeBpsModule, "getSwapFeeBps")
      .mockReturnValueOnce(15)
      .mockReturnValueOnce(10);

    const fromToken = mockToken({ address: "0xabc", isStable: false });
    const toToken = mockToken({ address: "0xdef", isStable: false });
    const result = getMaxSwapFeeBps({
      fromAmount: BigNumber.from(100),
      fromTokenInfo: fromToken,
      toTokenInfo: toToken,
      usdgSupply: BigNumber.from(0),
      totalWeight: BigNumber.from(0),
    });
    expect(result).toBe(15);
  });

  it("returns 0 if fromAmount is negative", () => {
    const fromToken = mockToken({ address: "0xabc" });
    const toToken = mockToken({ address: "0xdef" });
    const result = getMaxSwapFeeBps({
      fromAmount: BigNumber.from(-100),
      fromTokenInfo: fromToken,
      toTokenInfo: toToken,
      usdgSupply: BigNumber.from(0),
      totalWeight: BigNumber.from(0),
    });
    expect(result).toBe(0);
  });
});
