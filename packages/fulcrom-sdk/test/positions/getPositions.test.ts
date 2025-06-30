import { getPositions } from "../../src/positions/getPositions";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../src/positions/getPositions", () => {
  // Use the real implementation for getPositions
  const actual = jest.requireActual("../../src/positions/getPositions");
  return { ...actual };
});
jest.mock("../../src/positions/getPositionKey", () => ({
  getPositionKey: jest.fn(),
}));
jest.mock("../../src/config", () => ({
  BASIS_POINTS_DIVISOR: 10000,
  FUNDING_RATE_PRECISION: 1000000,
  getIndexTokens: jest.fn(),
}));
jest.mock("../../src/config/zero", () => ({
  BIG_NUM_ZERO: { toString: () => "0" },
}));
jest.mock("../../src/query/reader/getFundingRateMap", () => ({
  getFundingRateMapFn: jest.fn(),
}));
jest.mock("../../src/query/reader/getPositionDataFn", () => ({
  getPositionDataFn: jest.fn(),
  toRawPosition: jest.fn(),
}));
jest.mock("../../src/query/vault/getFixedLiquidationFeeUsd", () => ({
  getFixedLiquidationFeeUsd: jest.fn(),
}));
jest.mock("../../src/query/vault/getMaxLiquidationLeverage", () => ({
  getMaxLiquidationLeverage: jest.fn(),
}));
jest.mock("../../src/query/marginFeeBasisPoints", () => ({
  getMarginFeeBasisPoints: jest.fn(),
}));
jest.mock("../../src/utils/getTokensInfo", () => ({
  getTokensInfo: jest.fn(),
}));
jest.mock("../../src/cache", () => ({
  cacheKeys: {
    MarginFeeBasisPoints: "MarginFeeBasisPoints",
    MaxLiquidationLeverage: "MaxLiquidationLeverage",
    FixedLiquidationFeeUsd: "FixedLiquidationFeeUsd",
    FundingRateMap: "FundingRateMap",
    Positions: "Positions",
  },
  getDataWithCache: jest.fn(),
}));

// Mock all utils/position functions to return simple values
jest.mock("../../src/utils/position", () => ({
  getDelta: jest.fn(() => 1),
  getDeltaPercentage: jest.fn(() => 2),
  getHasLowCollateral: jest.fn(() => false),
  getHasProfit: jest.fn(() => true),
  getHasProfitAfterFees: jest.fn(() => true),
  getLiqPrice: jest.fn(() => 123),
  getNetValue: jest.fn(() => 1000),
  getNetValueAfterFees: jest.fn(() => 900),
  getPendingDelta: jest.fn(() => 10),
  getPendingDeltaAfterFees: jest.fn(() => 8),
  getPositionLeverage: jest.fn(() => 5),
}));
jest.mock("../../src/utils/getDeltaPercentageAfterFees", () => ({
  getDeltaPercentageAfterFees: jest.fn(() => 3),
}));

import { getDataWithCache, cacheKeys } from "../../src/cache";
import { getTokensInfo } from "../../src/utils/getTokensInfo";
import { getIndexTokens } from "../../src/config";
import { toRawPosition } from "../../src/query/reader/getPositionDataFn";
import { ChainId } from "../../src/types";

describe("getPositions", () => {
  const account = "0xabc";
  const chainId = ChainId.CRONOS_MAINNET;
  const caches = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns enriched positions when all data is present", async () => {
    // Mock getDataWithCache for each key
    (getDataWithCache as jest.Mock)
      .mockResolvedValueOnce(100) // marginFeeBasisPoints
      .mockResolvedValueOnce(50) // maxLiquidationLeverage
      .mockResolvedValueOnce(20) // fixedLiquidationFeeUsd
      .mockResolvedValueOnce({ "0xtoken": { cumulativeFundingRate: 1 } }) // fundingRateMap
      .mockResolvedValueOnce([{ key: "pos1", indexToken: "0xtoken", isLong: true, collateralToken: "0xtoken" }]); // positionData

    (getTokensInfo as jest.Mock).mockResolvedValue({
      "0xtoken": { minPrice: 100, maxPrice: 110 },
    });
    (getIndexTokens as jest.Mock).mockReturnValue(["0xtoken"]);
    (toRawPosition as jest.Mock).mockReturnValue([
      {
        key: "pos1",
        indexToken: "0xtoken",
        isLong: true,
        collateralToken: "0xtoken",
        averagePrice: BigNumber.from(100),
        collateral: BigNumber.from(1000),
        delta: BigNumber.from(10),
        entryFundingRate: BigNumber.from(1),
        hasProfit: true,
        hasRealisedProfit: false,
        lastIncreasedTime: 0,
        realisedPnl: 0,
        size: BigNumber.from(2000),
      },
    ]);

    const result = await getPositions({ account, chainId, caches });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result![0]).toHaveProperty("key", "pos1");
    expect(result![0]).toHaveProperty("leverage", 5);
    expect(result![0]).toHaveProperty("liqPrice", 123);
  });

  it("returns undefined if required data is missing", async () => {
    (getDataWithCache as jest.Mock).mockResolvedValueOnce(100) // marginFeeBasisPoints
      .mockResolvedValueOnce(50) // maxLiquidationLeverage
      .mockResolvedValueOnce(20) // fixedLiquidationFeeUsd
      .mockResolvedValueOnce(undefined); // fundingRateMap missing

    const result = await getPositions({ account, chainId, caches });
    expect(result).toBeUndefined();
  });
});
