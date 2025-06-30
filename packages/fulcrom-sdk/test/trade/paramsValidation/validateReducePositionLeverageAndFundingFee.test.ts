import { validateReducePositionLeverageAndFundingFee } from "../../../src/trade/paramsValidation/validateReducePositionLeverageAndFundingFee";
import { BigNumber } from "@ethersproject/bignumber";

// Mock all async and utility dependencies
jest.mock("../../../src/positions/getPosition", () => ({
  getPosition: jest.fn(),
}));
jest.mock("../../../src/utils/getNextLeverage", () => ({
  getNextLeverage: jest.fn(),
}));
jest.mock("../../../src/utils/numbers/parseValue", () => ({
  parseValue: (v: any) => BigNumber.from(v),
}));
jest.mock("../../../src/trade/utils/getFromUsdMin", () => ({
  getFromUsdMin: jest.fn(() => BigNumber.from(100)),
}));
jest.mock("../../../src/trade/utils/toValue", () => ({
  getToUsdMax: jest.fn(() => Promise.resolve(BigNumber.from(100))),
}));
jest.mock("../../../src/utils/fee", () => ({
  getDepositFee: jest.fn(() => BigNumber.from(1)),
  getCanCollateralAffordFundingFee: jest.fn(() => true),
  getCollateralThreshold: jest.fn(() => BigNumber.from(10)),
}));
jest.mock("../../../src/cache", () => ({
  getDataWithCache: jest.fn(() => Promise.resolve(1)),
  cacheKeys: {
    UsdgSypply: "UsdgSypply",
    TotalWeight: "TotalWeight",
    MarginFeeBasisPoints: "MarginFeeBasisPoints",
  },
}));
jest.mock("../../../src/query/erc20/totalSupply", () => ({
  getTotalSupply: jest.fn(() => Promise.resolve(1)),
}));
jest.mock("../../../src/query/totalWeight", () => ({
  getTotalWeight: jest.fn(() => Promise.resolve(1)),
}));
jest.mock("../../../src/query/marginFeeBasisPoints", () => ({
  getMarginFeeBasisPoints: jest.fn(() => Promise.resolve(1)),
}));
jest.mock("../../../src/trade/utils/maxSwapFeeBps", () => ({
  getMaxSwapFeeBps: jest.fn(() => 1),
}));
jest.mock("../../../src/trade/orders/types/orderType", () => ({
  isStopOrLimitOrder: jest.fn(() => true),
}));
jest.mock("../../../src/trade/utils/position", () => ({
  getMarginFee: jest.fn(() => BigNumber.from(1)),
}));
jest.mock("../../../src/utils/numbers/formatAmount", () => ({
  formatAmount: (v: any) => String(v),
}));
jest.mock("../../../src/utils/getNonZeroDecimalsPlaces", () => ({
  getNonZeroDecimalsPlaces: () => 2,
}));

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

describe("validateReducePositionLeverageAndFundingFee", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error if collateralTokenSymbol is missing for short", async () => {
    const params = { ...baseParams, isLongPosition: false, collateralTokenSymbol: undefined };
    const errors = await validateReducePositionLeverageAndFundingFee(params);
    expect(errors[0]).toMatch(/collateralTokenSymbol is required/);
  });

  it("returns error if leverage would be reduced", async () => {
    require("../../../src/positions/getPosition").getPosition.mockResolvedValue({
      leverage: BigNumber.from(10),
      isLong: true,
      fundingFee: BigNumber.from(1),
      poolAmount: BigNumber.from(100),
      reservedAmount: BigNumber.from(10),
    });
    require("../../../src/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from(5));
    const errors = await validateReducePositionLeverageAndFundingFee(baseParams);
    expect(errors[0]).toMatch(/reduce the position's leverage/);
  });

  it("returns error if cannot afford funding fee", async () => {
    require("../../../src/positions/getPosition").getPosition.mockResolvedValue({
      leverage: BigNumber.from(10),
      isLong: true,
      fundingFee: BigNumber.from(1),
      poolAmount: BigNumber.from(100),
      reservedAmount: BigNumber.from(10),
    });
    require("../../../src/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from(20));
    require("../../../src/utils/fee").getCanCollateralAffordFundingFee.mockReturnValue(false);
    const errors = await validateReducePositionLeverageAndFundingFee(baseParams);
    expect(errors[0]).toMatch(/to cover funding fee/);
  });

  it("returns [] if all checks pass", async () => {
    require("../../../src/positions/getPosition").getPosition.mockResolvedValue({
      leverage: BigNumber.from(10),
      isLong: true,
      fundingFee: BigNumber.from(1),
      poolAmount: BigNumber.from(100),
      reservedAmount: BigNumber.from(10),
    });
    require("../../../src/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from(20));
    require("../../../src/utils/fee").getCanCollateralAffordFundingFee.mockReturnValue(true);
    const errors = await validateReducePositionLeverageAndFundingFee(baseParams);
    expect(errors).toEqual([]);
  });
});
