import { BigNumber } from "ethers";
import { validateLiqStatus } from "../../../../src/trade/decrease/paramsValidation/validateLiqStatus";
import type { TokenSymbol } from "../../../../src/config";

// Mock validateLiquidation
jest.mock("../../../../src/query/vaultUtils", () => ({
  validateLiquidation: jest.fn(),
}));

const { validateLiquidation } = require("../../../../src/query/vaultUtils");

describe("validateLiqStatus", () => {
  const mockPosition = (overrides: Partial<any> = {}) => ({
    // RawPosition fields
    key: "0xkey",
    collateralToken: "0xcollateral",
    indexToken: "0xindex",
    isLong: true,
    size: BigNumber.from(0),
    collateral: BigNumber.from(0),
    averagePrice: BigNumber.from(0),
    entryFundingRate: BigNumber.from(0),
    hasRealisedProfit: false,
    realisedPnl: BigNumber.from(0),
    lastIncreasedTime: 0,
    hasProfit: false,
    delta: BigNumber.from(0),
    // Position fields
    cumulativeFundingRate: BigNumber.from(0),
    fundingFee: BigNumber.from(0),
    collateralAfterFee: BigNumber.from(0),
    closingFee: BigNumber.from(0),
    positionFee: BigNumber.from(0),
    totalFees: BigNumber.from(0),
    pendingDelta: BigNumber.from(0),
    hasLowCollateral: false,
    markPrice: BigNumber.from(0),
    deltaPercentage: BigNumber.from(0),
    hasProfitAfterFees: false,
    pendingDeltaAfterFees: BigNumber.from(0),
    deltaPercentageAfterFees: BigNumber.from(0),
    netValue: BigNumber.from(0),
    netValueAfterFees: BigNumber.from(0),
    leverage: BigNumber.from(0),
    liqPrice: BigNumber.from(100),
    ...overrides,
  });

  const mockTokenInfo = (overrides: Partial<any> = {}) => ({
    name: "Token",
    image: "",
    symbol: "USDT" as TokenSymbol,
    decimals: 18,
    address: "0xindex",
    isStable: false,
    isWrapped: false,
    isNative: false,
    isShortable: false,
    minPrice: BigNumber.from(120),
    maxPrice: BigNumber.from(130),
    displayDecimals: 2,
    displaySymbol: "USDT" as TokenSymbol,
    baseTokenSymbol: "USDT" as TokenSymbol,
    baseTokenImage: "",
    // ExtraTokenInfo fields
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
    averagePrice: BigNumber.from(0),
    globalShortSize: BigNumber.from(0),
    maxAvailableLong: BigNumber.from(0),
    maxAvailableShort: BigNumber.from(0),
    maxGlobalLongSize: BigNumber.from(0),
    maxGlobalShortSize: BigNumber.from(0),
    maxLongCapacity: BigNumber.from(0),
    // CandlePricesInfo field
    candlePrices: {
      time: 0,
      open: 0,
      close: 0,
      high: 0,
      low: 0,
    },
    ...overrides,
  });

  const baseParams = {
    account: "0xaccount",
    chainId: 1,
    position: mockPosition(),
    isLongPosition: true,
    indexTokenInfo: mockTokenInfo(),
  };

  it("returns [] if not pending liquidation (liqStatus isZero, liqPrice < minPrice)", async () => {
    validateLiquidation.mockResolvedValue(BigNumber.from(0));
    const params = {
      ...baseParams,
      position: mockPosition({ liqPrice: BigNumber.from(100) }),
      indexTokenInfo: mockTokenInfo({ minPrice: BigNumber.from(120) }),
    };
    const result = await validateLiqStatus(params);
    expect(result).toEqual([]);
  });

  it("returns error if liqStatus is not zero", async () => {
    validateLiquidation.mockResolvedValue(BigNumber.from(1));
    const result = await validateLiqStatus(baseParams);
    expect(result).toContain("Pending Liquidation");
  });

  it("returns error if liqPrice >= minPrice for long", async () => {
    validateLiquidation.mockResolvedValue(BigNumber.from(0));
    const params = {
      ...baseParams,
      position: mockPosition({ liqPrice: BigNumber.from(130) }),
      indexTokenInfo: mockTokenInfo({ minPrice: BigNumber.from(120) }),
    };
    const result = await validateLiqStatus(params);
    expect(result).toContain("Pending Liquidation");
  });

  it("returns error if liqPrice <= maxPrice for short", async () => {
    validateLiquidation.mockResolvedValue(BigNumber.from(0));
    const params = {
      ...baseParams,
      isLongPosition: false,
      position: mockPosition({ liqPrice: BigNumber.from(110) }),
      indexTokenInfo: mockTokenInfo({ maxPrice: BigNumber.from(120) }),
    };
    const result = await validateLiqStatus(params);
    expect(result).toContain("Pending Liquidation");
  });
});
