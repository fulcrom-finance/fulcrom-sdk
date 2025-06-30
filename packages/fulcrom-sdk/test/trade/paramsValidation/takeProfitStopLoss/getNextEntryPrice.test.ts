import { getNextEntryPrice } from "../../../../src/trade/paramsValidation/takeProfitStopLoss/getNextEntryPrice";
import * as entryPriceModule from "../../../../src/trade/utils/entryPrice";
import * as nextAvgPriceModule from "../../../../src/trade/paramsValidation/takeProfitStopLoss/getNextAveragePrice";
import { ChainId } from "../../../../src/types/chain";
import { OrderType } from "../../../../src/trade/orders/types/orderType";
import { TokenInfo } from "../../../../src/types/tokens";
import { Position } from "../../../../src/types/position";

jest.mock("../../../../src/trade/utils/entryPrice");
jest.mock("../../../../src/trade/paramsValidation/takeProfitStopLoss/getNextAveragePrice");

describe("getNextEntryPrice", () => {
  const mockToken: TokenInfo = {
    address: "0xToken",
    decimals: 18,
    name: "Mock Token",
    symbol: "BTC",
    image: "",
    baseTokenSymbol: "BTC",
    baseTokenImage: "",
    displayDecimals: 2,
    displaySymbol: "BTC",
    isStable: false,
    isNative: false,
    minPrice: {} as any,
    maxPrice: {} as any,
    usdgAmount: {} as any,
    maxUsdgAmount: {} as any,
    poolAmount: {} as any,
    bufferAmount: {} as any,
    managedAmount: {} as any,
    managedUsd: {} as any,
    availableAmount: {} as any,
    availableUsd: {} as any,
    guaranteedUsd: {} as any,
    redemptionAmount: {} as any,
    reservedAmount: {} as any,
    balance: {} as any,
    balanceUsdMin: {} as any,
    balanceUsdMax: {} as any,
    weight: {} as any,
    averagePrice: {} as any,
    globalShortSize: {} as any,
    maxAvailableLong: {} as any,
    maxAvailableShort: {} as any,
    maxGlobalLongSize: {} as any,
    maxGlobalShortSize: {} as any,
    maxLongCapacity: {} as any,
    candlePrices: {} as any,
  };

  const mockPosition: Position = {
    key: "mock",
    collateralToken: "0xToken",
    indexToken: "0xToken",
    isLong: true,
    size: {} as any,
    collateral: {} as any,
    averagePrice: {} as any,
    entryFundingRate: {} as any,
    hasRealisedProfit: false,
    realisedPnl: {} as any,
    lastIncreasedTime: 0,
    hasProfit: false,
    delta: {} as any,
    cumulativeFundingRate: {} as any,
    fundingFee: {} as any,
    collateralAfterFee: {} as any,
    closingFee: {} as any,
    positionFee: {} as any,
    totalFees: {} as any,
    pendingDelta: {} as any,
    hasLowCollateral: false,
    markPrice: {} as any,
    deltaPercentage: {} as any,
    hasProfitAfterFees: false,
    pendingDeltaAfterFees: {} as any,
    deltaPercentageAfterFees: {} as any,
    netValue: {} as any,
    netValueAfterFees: {} as any,
    leverage: {} as any,
    liqPrice: {} as any,
  };

  const mockCaches = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
    (entryPriceModule.getEntryPrice as jest.Mock).mockReturnValue("entryPriceValue");
    (nextAvgPriceModule.getNextAveragePrice as jest.Mock).mockResolvedValue("nextAvgPriceValue");
  });

  it("returns entryPrice when existingPosition is undefined", async () => {
    const result = await getNextEntryPrice({
      chainId: ChainId.CRONOS_MAINNET,
      fromToken: mockToken,
      transactionAmount: "100",
      toToken: mockToken,
      orderType: OrderType.Market,
      isLongPosition: true,
      collateralTokenInfo: mockToken,
      leverageRatio: 10,
      triggerExecutionPrice: "10",
      existingPosition: undefined,
      caches: mockCaches,
    });
    expect(result).toBe("entryPriceValue");
    expect(entryPriceModule.getEntryPrice).toHaveBeenCalled();
    expect(nextAvgPriceModule.getNextAveragePrice).toHaveBeenCalled();
  });

  it("returns nextAveragePrice when existingPosition is present", async () => {
    const result = await getNextEntryPrice({
      chainId: ChainId.CRONOS_MAINNET,
      fromToken: mockToken,
      transactionAmount: "100",
      toToken: mockToken,
      orderType: OrderType.Market,
      isLongPosition: true,
      collateralTokenInfo: mockToken,
      leverageRatio: 10,
      triggerExecutionPrice: "10",
      existingPosition: mockPosition,
      caches: mockCaches,
    });
    expect(result).toBe("nextAvgPriceValue");
    expect(entryPriceModule.getEntryPrice).toHaveBeenCalled();
    expect(nextAvgPriceModule.getNextAveragePrice).toHaveBeenCalled();
  });
});
