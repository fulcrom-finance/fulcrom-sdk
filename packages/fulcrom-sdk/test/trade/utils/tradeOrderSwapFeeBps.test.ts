import { BigNumber } from "@ethersproject/bignumber";
import { getOrderSwapFeeBps } from "../../../src/trade/utils/tradeOrderSwapFeeBps";
import type { TokenInfo } from "../../../src/types/tokens";

jest.mock("../../../src/cache", () => ({
  getDataWithCache: jest.fn(),
  cacheKeys: { UsdgSypply: "UsdgSypply", TotalWeight: "TotalWeight" },
}));
jest.mock("../../../src/config", () => ({
  getContractAddress: jest.fn(),
}));
jest.mock("../../../src/trade/utils/tradeOrderSwapFee", () => ({
  getTradeOrderSwapFeeBps: jest.fn(),
}));

import { getDataWithCache } from "../../../src/cache";
import { getContractAddress } from "../../../src/config";
import { getTradeOrderSwapFeeBps } from "../../../src/trade/utils/tradeOrderSwapFee";

describe("getOrderSwapFeeBps", () => {
  const chainId = 25 as any;
  const caches = new Map();
  const tokenBase: TokenInfo = {
    name: "Token",
    image: "",
    symbol: "FUL",
    displaySymbol: "FUL",
    baseTokenSymbol: "FUL",
    baseTokenImage: "",
    displayDecimals: 18,
    isStable: false,
    isNative: false,
    address: "0xA",
    decimals: 18,
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
    maxPrice: BigNumber.from(0),
    minPrice: BigNumber.from(0),
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
  };
  const fromTokenInfo = { ...tokenBase, address: "0xfrom" };
  const shortCollateralTokenInfo = { ...tokenBase, address: "0xshort" };
  const toTokenInfo = { ...tokenBase, address: "0xto" };

  beforeEach(() => {
    jest.clearAllMocks();
    (getContractAddress as jest.Mock).mockReturnValue("0xUSDG");
  });

  it("calls getTradeOrderSwapFeeBps with correct args and returns its value", async () => {
    (getDataWithCache as jest.Mock)
      .mockResolvedValueOnce(BigNumber.from(1000)) // usdgSupply
      .mockResolvedValueOnce(BigNumber.from(2000)); // totalWeight
    (getTradeOrderSwapFeeBps as jest.Mock).mockReturnValue(123);

    const result = await getOrderSwapFeeBps(
      chainId,
      true,
      BigNumber.from(500),
      fromTokenInfo,
      shortCollateralTokenInfo,
      toTokenInfo,
      caches
    );
    expect(getDataWithCache).toHaveBeenCalledTimes(2);
    expect(getContractAddress).toHaveBeenCalledWith("USDG", chainId);
    expect(getTradeOrderSwapFeeBps).toHaveBeenCalledWith({
      order: {
        collateralToken: toTokenInfo.address,
        indexToken: toTokenInfo.address,
        isLong: true,
        purchaseToken: fromTokenInfo.address,
        purchaseTokenAmount: BigNumber.from(500),
      },
      totalWeight: BigNumber.from(2000),
      usdgSupply: BigNumber.from(1000),
      toTokenInfo,
      purchaseTokenInfo: fromTokenInfo,
      collateralTokenInfo: shortCollateralTokenInfo,
    });
    expect(result).toBe(123);
  });

  it("handles isLong false and different fromAmount", async () => {
    (getDataWithCache as jest.Mock)
      .mockResolvedValueOnce(BigNumber.from(1111))
      .mockResolvedValueOnce(BigNumber.from(2222));
    (getTradeOrderSwapFeeBps as jest.Mock).mockReturnValue(456);

    const result = await getOrderSwapFeeBps(
      chainId,
      false,
      BigNumber.from(999),
      fromTokenInfo,
      shortCollateralTokenInfo,
      toTokenInfo,
      caches
    );
    expect(getTradeOrderSwapFeeBps).toHaveBeenCalledWith({
      order: {
        collateralToken: shortCollateralTokenInfo.address,
        indexToken: toTokenInfo.address,
        isLong: false,
        purchaseToken: fromTokenInfo.address,
        purchaseTokenAmount: BigNumber.from(999),
      },
      totalWeight: BigNumber.from(2222),
      usdgSupply: BigNumber.from(1111),
      toTokenInfo,
      purchaseTokenInfo: fromTokenInfo,
      collateralTokenInfo: shortCollateralTokenInfo,
    });
    expect(result).toBe(456);
  });
});
