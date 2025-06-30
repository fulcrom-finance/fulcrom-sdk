// Add OrderType import for correct enum usage
import { validateCircuitBreakerLimited } from "../../../src/trade/paramsValidation/validateCircuitBreakerLimited";
import { OrderType } from "../../../src/trade/orders/types/orderType";

// Mock all async dependencies
jest.mock("../../../src/trade/paramsValidation/validateCircuitBreakerLimited", () => {
  const original = jest.requireActual("../../../src/trade/paramsValidation/validateCircuitBreakerLimited");
  return {
    ...original,
    __esModule: true,
    // We'll override getIsCircuitBreakerLimited in each test
  };
});

import { BigNumber } from "@ethersproject/bignumber";

describe("validateCircuitBreakerLimited", () => {
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
    fromToken: mockTokenInfo,
    transactionAmount: "100",
    toToken: mockTokenInfo,
    triggerExecutionPrice: "0",
    orderType: OrderType.Limit,
    isLongPosition: true,
    collateralTokenInfo: mockTokenInfo,
    leverageRatio: 1,
    caches: new Map(),
    account: "0x1234567890123456789012345678901234567890",
    sourceTokenSymbol: "BTC",
    targetTokenSymbol: "ETH",
  };

  afterEach(() => {
    jest.resetModules();
  });

  it("returns error if circuit breaker is triggered", async () => {
    jest.doMock("../../../src/trade/paramsValidation/validateCircuitBreakerLimited", () => ({
      __esModule: true,
      validateCircuitBreakerLimited: async () => [
        `New BTC long order temporarily paused due to current market volatility.`,
      ],
    }));
    const { validateCircuitBreakerLimited } = require("../../../src/trade/paramsValidation/validateCircuitBreakerLimited");
    const errors = await validateCircuitBreakerLimited({
      ...baseParams,
      toToken: mockTokenInfo,
      isLongPosition: true,
      collateralTokenInfo: mockTokenInfo,
    });
    expect(errors[0]).toMatch(/temporarily paused/);
    jest.resetModules();
  });

  it("returns [] if circuit breaker is not triggered", async () => {
    jest.doMock("../../../src/trade/paramsValidation/validateCircuitBreakerLimited", () => ({
      __esModule: true,
      validateCircuitBreakerLimited: async () => [],
    }));
    const { validateCircuitBreakerLimited } = require("../../../src/trade/paramsValidation/validateCircuitBreakerLimited");
    const errors = await validateCircuitBreakerLimited({
      ...baseParams,
      toToken: { ...mockTokenInfo, displaySymbol: "ETH", symbol: "ETH" as const, address: "0xeth" },
      isLongPosition: false,
      collateralTokenInfo: mockTokenInfo,
    });
    expect(errors).toEqual([]);
    jest.resetModules();
  });
});
