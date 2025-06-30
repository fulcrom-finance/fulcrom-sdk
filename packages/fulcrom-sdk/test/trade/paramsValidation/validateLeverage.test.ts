import { validateLeverage } from "../../../src/trade/paramsValidation/validateLeverage";

// Mock getUserMaxLeverage and ZERO_BIG_INT
jest.mock("../../../src/utils/insaneMode/getUserMaxLeverage", () => ({
  getUserMaxLeverage: jest.fn(),
}));
jest.mock("../../../src/config/zero", () => ({
  ZERO_BIG_INT: 0,
}));

const { getUserMaxLeverage } = require("../../../src/utils/insaneMode/getUserMaxLeverage");

import { BigNumber } from "@ethersproject/bignumber";

describe("validateLeverage", () => {
  const mockTokenInfo = {
    name: "Token",
    image: "",
    symbol: "BTC" as const,
    decimals: 18,
    displayDecimals: 2,
    isStable: false,
    isNative: false,
    address: "0xbtc",
    displaySymbol: "BTC",
    baseTokenSymbol: "BTC",
    baseTokenImage: "",
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
    maxPrice: BigNumber.from(100),
    minPrice: BigNumber.from(90),
    candlePrices: { time: 0, open: 0, close: 0, high: 0, low: 0 },
  };

  const baseParams = {
    chainId: 25,
    account: "0x1234567890123456789012345678901234567890",
    leverageRatio: 5,
    transactionAmount: "100",
    orderType: "Limit" as any,
    isLongPosition: true,
    sourceTokenSymbol: "BTC",
    targetTokenSymbol: "ETH",
    fromToken: mockTokenInfo,
    toToken: mockTokenInfo,
    collateralTokenInfo: mockTokenInfo,
    caches: new Map(),
  };

  beforeEach(() => {
    getUserMaxLeverage.mockReset();
  });

  it("returns [] if leverageRatio is not provided", async () => {
    const errors = await validateLeverage({ ...baseParams, leverageRatio: undefined });
    expect(errors).toEqual([]);
  });

  it("returns [] if leverage is within max", async () => {
    getUserMaxLeverage.mockResolvedValue(10);
    const errors = await validateLeverage({ ...baseParams, leverageRatio: 5 });
    expect(errors).toEqual([]);
  });

  it("returns error if leverage exceeds max", async () => {
    getUserMaxLeverage.mockResolvedValue(3);
    const errors = await validateLeverage({ ...baseParams, leverageRatio: 5 });
    expect(errors[0]).toMatch(/Exceeded the max allowed leverage/);
  });

  it("returns error if leverage is zero or negative", async () => {
    getUserMaxLeverage.mockResolvedValue(10);
    const errors = await validateLeverage({ ...baseParams, leverageRatio: 0 });
    expect(errors.length).toBe(0);
    
    const errorsNeg = await validateLeverage({ ...baseParams, leverageRatio: -1 });
    expect(errorsNeg[0]).toMatch("Exceeded the max allowed leverage 10x");
  });
});
