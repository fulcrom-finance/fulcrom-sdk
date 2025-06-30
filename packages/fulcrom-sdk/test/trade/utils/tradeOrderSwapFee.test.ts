import { BigNumber } from "@ethersproject/bignumber";
import {
  getTradeOrderSwapFee,
  getTradeOrderSwapFeeBps,
} from "../../../src/trade/utils/tradeOrderSwapFee";

jest.mock("../../../src/trade/utils/maxSwapFeeBps", () => ({
  getMaxSwapFeeBps: jest.fn(),
}));
jest.mock("../../../src/utils/numbers/expandDecimals", () => ({
  expandDecimals: jest.fn(),
}));
jest.mock("../../../src/config", () => ({
  BASIS_POINTS_DIVISOR: 10000,
}));

import { getMaxSwapFeeBps } from "../../../src/trade/utils/maxSwapFeeBps";
import { expandDecimals } from "../../../src/utils/numbers/expandDecimals";
import type { TokenInfo } from "../../../src/types/tokens";

const makeToken = (overrides: Partial<TokenInfo> = {}): TokenInfo => ({
  name: "Token",
  image: "",
  symbol: "USDC",
  displaySymbol: "USDC",
  baseTokenSymbol: "USDC",
  baseTokenImage: "",
  displayDecimals: 18,
  address: "0xA",
  decimals: 18,
  usdgAmount: BigNumber.from(0),
  maxUsdgAmount: BigNumber.from(0),
  poolAmount: BigNumber.from(0),
  bufferAmount: BigNumber.from(0),
  managedAmount: BigNumber.from(0),
  managedUsd: BigNumber.from(0),
  availableAmount: BigNumber.from(0),
  availableUsd: BigNumber.from(0),
  guaranteedUsd: BigNumber.from(0),
  redemptionAmount: BigNumber.from(0),
  reservedAmount: BigNumber.from(0),
  balance: BigNumber.from(0),
  balanceUsdMin: BigNumber.from(0),
  balanceUsdMax: BigNumber.from(0),
  weight: BigNumber.from(0),
  minPrice: BigNumber.from(100),
  maxPrice: BigNumber.from(100),
  averagePrice: BigNumber.from(0),
  globalShortSize: BigNumber.from(0),
  maxAvailableLong: BigNumber.from(0),
  maxAvailableShort: BigNumber.from(0),
  maxGlobalLongSize: BigNumber.from(0),
  maxGlobalShortSize: BigNumber.from(0),
  maxLongCapacity: BigNumber.from(0),
  isStable: false,
  isNative: false,
  candlePrices: {
    time: 0,
    open: 0,
    close: 0,
    high: 0,
    low: 0,
  },
  ...overrides,
});

describe("tradeOrderSwapFee", () => {
  const usdgSupply = BigNumber.from(10000);
  const totalWeight = BigNumber.from(1000);

  beforeEach(() => {
    jest.clearAllMocks();
    (expandDecimals as jest.Mock).mockReturnValue(BigNumber.from(100));
  });

  it("returns 0 fee if swap is not needed (long, purchaseToken == toToken)", () => {
    const order = {
      isLong: true,
      purchaseTokenAmount: BigNumber.from(1000),
      purchaseToken: "0xA",
      indexToken: "0xB",
      collateralToken: "0xC",
    };
    const token = makeToken({ address: "0xA" });
    const fee = getTradeOrderSwapFee({
      order,
      toTokenInfo: token,
      purchaseTokenInfo: token,
      collateralTokenInfo: makeToken({ address: "0xC" }),
      usdgSupply,
      totalWeight,
    });
    expect(fee.toString()).toBe("0");
  });

  it("returns 0 fee if swap is not needed (short, purchaseToken == collateralToken)", () => {
    const order = {
      isLong: false,
      purchaseTokenAmount: BigNumber.from(1000),
      purchaseToken: "0xC",
      indexToken: "0xB",
      collateralToken: "0xC",
    };
    const token = makeToken({ address: "0xC" });
    const fee = getTradeOrderSwapFee({
      order,
      toTokenInfo: makeToken({ address: "0xA" }),
      purchaseTokenInfo: token,
      collateralTokenInfo: token,
      usdgSupply,
      totalWeight,
    });
    expect(fee.toString()).toBe("0");
  });

  it("returns correct fee for long, swap needed", () => {
    (getMaxSwapFeeBps as jest.Mock).mockReturnValue(50); // 0.5%
    const order = {
      isLong: true,
      purchaseTokenAmount: BigNumber.from(1000),
      purchaseToken: "0xA",
      indexToken: "0xB",
      collateralToken: "0xC",
    };
    const toToken = makeToken({ address: "0xB", minPrice: BigNumber.from(200) });
    const purchaseToken = makeToken({ address: "0xA", minPrice: BigNumber.from(200) });
    const fee = getTradeOrderSwapFee({
      order,
      toTokenInfo: toToken,
      purchaseTokenInfo: purchaseToken,
      collateralTokenInfo: makeToken({ address: "0xC" }),
      usdgSupply,
      totalWeight,
    });
    // fromAmount = 1000, minPrice = 200, expandDecimals = 100, swapFeeBps = 50
    // fromUsdMin = 1000 * 200 / 100 = 2000
    // fee = 2000 * 50 / 10000 = 10
    expect(fee.toString()).toBe("10");
  });

  it("returns correct fee for short, swap needed", () => {
    (getMaxSwapFeeBps as jest.Mock).mockReturnValue(100); // 1%
    const order = {
      isLong: false,
      purchaseTokenAmount: BigNumber.from(1000),
      purchaseToken: "0xA",
      indexToken: "0xB",
      collateralToken: "0xC",
    };
    const purchaseToken = makeToken({ address: "0xA", minPrice: BigNumber.from(200) });
    const collateralToken = makeToken({ address: "0xC", minPrice: BigNumber.from(200) });
    const fee = getTradeOrderSwapFee({
      order,
      toTokenInfo: makeToken({ address: "0xB" }),
      purchaseTokenInfo: purchaseToken,
      collateralTokenInfo: collateralToken,
      usdgSupply,
      totalWeight,
    });
    // fromAmount = 1000, minPrice = 200, expandDecimals = 100, swapFeeBps = 100
    // fromUsdMin = 1000 * 200 / 100 = 2000
    // fee = 2000 * 100 / 10000 = 20
    expect(fee.toString()).toBe("20");
  });

  it("getTradeOrderSwapFeeBps returns 0 if swap not needed", () => {
    const order = {
      isLong: true,
      purchaseTokenAmount: BigNumber.from(1000),
      purchaseToken: "0xA",
      indexToken: "0xB",
      collateralToken: "0xC",
    };
    const token = makeToken({ address: "0xA" });
    const bps = getTradeOrderSwapFeeBps({
      order,
      toTokenInfo: token,
      purchaseTokenInfo: token,
      collateralTokenInfo: makeToken({ address: "0xC" }),
      usdgSupply,
      totalWeight,
    });
    expect(bps).toBe(0);
  });

  it("getTradeOrderSwapFeeBps returns getMaxSwapFeeBps if swap needed", () => {
    (getMaxSwapFeeBps as jest.Mock).mockReturnValue(123);
    const order = {
      isLong: true,
      purchaseTokenAmount: BigNumber.from(1000),
      purchaseToken: "0xA",
      indexToken: "0xB",
      collateralToken: "0xC",
    };
    const toToken = makeToken({ address: "0xB" });
    const purchaseToken = makeToken({ address: "0xA" });
    const bps = getTradeOrderSwapFeeBps({
      order,
      toTokenInfo: toToken,
      purchaseTokenInfo: purchaseToken,
      collateralTokenInfo: makeToken({ address: "0xC" }),
      usdgSupply,
      totalWeight,
    });
    expect(bps).toBe(123);
  });

  it("returns 0 fee for zero purchaseTokenAmount", () => {
    (getMaxSwapFeeBps as jest.Mock).mockReturnValue(100);
    const order = {
      isLong: true,
      purchaseTokenAmount: BigNumber.from(0),
      purchaseToken: "0xA",
      indexToken: "0xB",
      collateralToken: "0xC",
    };
    const toToken = makeToken({ address: "0xB" });
    const purchaseToken = makeToken({ address: "0xA" });
    const fee = getTradeOrderSwapFee({
      order,
      toTokenInfo: toToken,
      purchaseTokenInfo: purchaseToken,
      collateralTokenInfo: makeToken({ address: "0xC" }),
      usdgSupply,
      totalWeight,
    });
    expect(fee.toString()).toBe("0");
  });
});
