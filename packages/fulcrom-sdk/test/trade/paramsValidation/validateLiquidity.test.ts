import { validateLiquidity } from "../../../src/trade/paramsValidation/validateLiquidity";
import { BigNumber } from "@ethersproject/bignumber";
import { ChainId } from "../../../src/types";
import { OrderType } from "../../../src/trade/orders/types/orderType";
import { TokenSymbol } from "../../../src/config";

// Mock all async and utility dependencies
jest.mock("../../../src/utils/getMaxAvailableShort", () => ({
  getMaxAvailableShort: jest.fn(() => BigNumber.from(1000)),
}));
jest.mock("../../../src/utils/numbers/parseValue", () => ({
  parseValue: (v) => BigNumber.from(v),
}));
jest.mock("../../../src/trade/paramsValidation/validateLiquidity", () => {
  const original = jest.requireActual("../../../src/trade/paramsValidation/validateLiquidity");
  return {
    ...original,
    __esModule: true,
  };
});
jest.mock("../../../src/trade/utils/getFromUsdMin", () => ({
  getFromUsdMin: jest.fn(() => BigNumber.from(100)),
}));
jest.mock("../../../src/trade/utils/getIsNeedSwap", () => ({
  getIsNeedSwap: jest.fn(() => true),
}));
jest.mock("../../../src/trade/utils/nextToAmount", () => ({
  getNextToAmount: jest.fn(() => Promise.resolve(BigNumber.from(100))),
}));
jest.mock("../../../src/trade/utils/toValue", () => ({
  getToUsdMax: jest.fn(() => Promise.resolve(BigNumber.from(100))),
}));

const mockTokenInfo = {
  name: "Token",
  image: "",
  symbol: "BTC" as TokenSymbol,
  decimals: 18,
  displayDecimals: 2,
  isStable: false,
  isNative: false,
  address: "0xbtc",
  displaySymbol: "BTC",
  baseTokenSymbol: "BTC",
  baseTokenImage: "",
  usdgAmount: BigNumber.from(0),
  maxUsdgAmount: BigNumber.from(10000),
  poolAmount: BigNumber.from(10000),
  bufferAmount: BigNumber.from(0),
  managedAmount: BigNumber.from(0),
  managedUsd: BigNumber.from(0),
  availableAmount: BigNumber.from(10000),
  availableUsd: BigNumber.from(10000),
  guaranteedUsd: BigNumber.from(0),
  redemptionAmount: BigNumber.from(0),
  reservedAmount: BigNumber.from(0),
  balance: BigNumber.from(0),
  balanceUsdMin: BigNumber.from(0),
  balanceUsdMax: BigNumber.from(0),
  weight: BigNumber.from(0),
  averagePrice: BigNumber.from(0),
  globalShortSize: BigNumber.from(0),
  maxAvailableLong: BigNumber.from(1000),
  maxAvailableShort: BigNumber.from(1000),
  maxGlobalLongSize: BigNumber.from(0),
  maxGlobalShortSize: BigNumber.from(0),
  maxLongCapacity: BigNumber.from(0),
  maxPrice: BigNumber.from(100),
  minPrice: BigNumber.from(90),
  candlePrices: { time: 0, open: 0, close: 0, high: 0, low: 0 },
};

const baseParams = {
  chainId: ChainId.CRONOS_TESTNET,
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

describe("validateLiquidity", () => {
  it("returns [] if within max long/short and sufficient liquidity", async () => {
    // Ensure all mocked values are below thresholds and swap logic passes
    jest.spyOn(require("../../../src/trade/utils/toValue"), "getToUsdMax").mockImplementationOnce(() => Promise.resolve(BigNumber.from(0)));
    jest.spyOn(require("../../../src/trade/utils/nextToAmount"), "getNextToAmount").mockImplementationOnce(() => Promise.resolve(BigNumber.from(0)));
    jest.spyOn(require("../../../src/utils/getMaxAvailableShort"), "getMaxAvailableShort").mockImplementationOnce(() => BigNumber.from(1000));
    jest.spyOn(require("../../../src/trade/utils/getFromUsdMin"), "getFromUsdMin").mockImplementationOnce(() => BigNumber.from(0));
    const params = {
      ...baseParams,
      toToken: { ...mockTokenInfo, maxAvailableLong: BigNumber.from(1000), maxAvailableShort: BigNumber.from(1000), availableAmount: BigNumber.from(1_000_000), bufferAmount: BigNumber.from(0), poolAmount: BigNumber.from(1_000_000) },
      fromToken: { ...mockTokenInfo, usdgAmount: BigNumber.from(0) },
      collateralTokenInfo: { ...mockTokenInfo, bufferAmount: BigNumber.from(0), poolAmount: BigNumber.from(1_000_000) },
    };
    const errors = await validateLiquidity(params);
    expect(errors).toEqual([]);
  });

  it("returns error if pool exceeded for swap", async () => {
    // Force swap logic to pass by returning 0 for all swap-related values
    jest.spyOn(require("../../../src/trade/utils/toValue"), "getToUsdMax").mockImplementationOnce(() => Promise.resolve(BigNumber.from(0)));
    jest.spyOn(require("../../../src/trade/utils/nextToAmount"), "getNextToAmount").mockImplementationOnce(() => Promise.resolve(BigNumber.from(0)));
    jest.spyOn(require("../../../src/trade/utils/getFromUsdMin"), "getFromUsdMin").mockImplementationOnce(() => BigNumber.from(0));
    const params = {
      ...baseParams,
      fromToken: { ...mockTokenInfo, usdgAmount: BigNumber.from(10001) },
      toToken: { ...mockTokenInfo, availableAmount: BigNumber.from(1_000_000), bufferAmount: BigNumber.from(0), poolAmount: BigNumber.from(1_000_000) },
      collateralTokenInfo: { ...mockTokenInfo, bufferAmount: BigNumber.from(0), poolAmount: BigNumber.from(1_000_000) },
    };
    const errors = await validateLiquidity(params);
    expect(errors[0]).toMatch(/pool exceeded/);
  });

  it("returns error if max long exceeded", async () => {
    jest.spyOn(require("../../../src/trade/utils/toValue"), "getToUsdMax").mockImplementationOnce(() => Promise.resolve(BigNumber.from(1001)));
    const params = {
      ...baseParams,
      toToken: { ...mockTokenInfo, maxAvailableLong: BigNumber.from(50) },
    };
    const errors = await validateLiquidity(params);
    expect(errors[0]).toMatch(/Max BTC long exceeded/);
  });

  it("returns error if max short exceeded", async () => {
    jest.spyOn(require("../../../src/trade/utils/toValue"), "getToUsdMax").mockImplementationOnce(() => Promise.resolve(BigNumber.from(1001)));
    jest.spyOn(require("../../../src/utils/getMaxAvailableShort"), "getMaxAvailableShort").mockImplementationOnce(() => BigNumber.from(50));
    const params = {
      ...baseParams,
      isLongPosition: false,
      toToken: { ...mockTokenInfo, maxAvailableShort: BigNumber.from(50) },
    };
    const errors = await validateLiquidity(params);
    expect(errors[0]).toMatch(/Max BTC short exceeded/);
  });

  it("returns error if insufficient liquidity for swap", async () => {
    const { getNextToAmount } = require("../../../src/trade/utils/nextToAmount");
    getNextToAmount.mockImplementationOnce(() => Promise.resolve(BigNumber.from(10000)));
    const params = {
      ...baseParams,
      toToken: { ...mockTokenInfo, availableAmount: BigNumber.from(50) },
    };
    const errors = await validateLiquidity(params);
    expect(errors[0]).toMatch(/Insufficient liquidity/);
  });
});
