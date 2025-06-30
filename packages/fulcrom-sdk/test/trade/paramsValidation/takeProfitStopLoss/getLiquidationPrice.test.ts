import { getLiquidationPrice } from "../../../../src/trade/paramsValidation/takeProfitStopLoss/getLiquidationPrice";
import * as cacheModule from "../../../../src/cache/getDataWithCache";
import * as marginFeeModule from "../../../../src/query/marginFeeBasisPoints";
import * as maxLiqLevModule from "../../../../src/query/vault/getMaxLiquidationLeverage";
import * as fixedLiqFeeModule from "../../../../src/query/vault/getFixedLiquidationFeeUsd";
import * as nextAvgPriceModule from "../../../../src/trade/paramsValidation/takeProfitStopLoss/getNextAveragePrice";
import * as toUsdMaxModule from "../../../../src/trade/utils/toValue";
import * as fromUsdMinModule from "../../../../src/trade/utils/getFromUsdMin";
import * as liqPriceModule from "../../../../src/utils/position";
import * as entryPriceModule from "../../../../src/trade/utils/entryPrice";
import { BigNumber } from "@ethersproject/bignumber";
import { Position } from "../../../../src/types/position";
import { TokenInfo } from "../../../../src/types/tokens";
import { ChainId } from "../../../../src/types/chain";
import { OrderType } from "../../../../src/trade/orders/types/orderType";

jest.mock("../../../../src/cache/getDataWithCache");
jest.mock("../../../../src/query/marginFeeBasisPoints");
jest.mock("../../../../src/query/vault/getMaxLiquidationLeverage");
jest.mock("../../../../src/query/vault/getFixedLiquidationFeeUsd");
jest.mock("../../../../src/trade/paramsValidation/takeProfitStopLoss/getNextAveragePrice");
jest.mock("../../../../src/trade/utils/toValue");
jest.mock("../../../../src/trade/utils/getFromUsdMin");
jest.mock("../../../../src/utils/position");
jest.mock("../../../../src/trade/utils/entryPrice");

describe("getLiquidationPrice", () => {
  // Minimal type-correct mock for TokenInfo
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
    minPrice: BigNumber.from(1),
    maxPrice: BigNumber.from(1),
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
    candlePrices: {} as any,
  };

  // Minimal type-correct mock for Position
  const mockPosition: Position = {
    key: "mock",
    collateralToken: "0xToken",
    indexToken: "0xToken",
    isLong: true,
    size: BigNumber.from(1000),
    collateral: BigNumber.from(100),
    averagePrice: BigNumber.from(10),
    entryFundingRate: BigNumber.from(0),
    hasRealisedProfit: false,
    realisedPnl: BigNumber.from(0),
    lastIncreasedTime: 0,
    hasProfit: false,
    delta: BigNumber.from(0),
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
    liqPrice: BigNumber.from(0),
  };

  // Use a Map for caches as required by the function signature
  const mockCaches = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
    (cacheModule.getDataWithCache as jest.Mock).mockResolvedValue(100);
    (marginFeeModule.getMarginFeeBasisPoints as jest.Mock).mockResolvedValue(10);
    (maxLiqLevModule.getMaxLiquidationLeverage as jest.Mock).mockResolvedValue(50);
    (fixedLiqFeeModule.getFixedLiquidationFeeUsd as jest.Mock).mockResolvedValue("5");
    (nextAvgPriceModule.getNextAveragePrice as jest.Mock).mockResolvedValue("12");
    (toUsdMaxModule.getToUsdMax as jest.Mock).mockResolvedValue("1000");
    (fromUsdMinModule.getFromUsdMin as jest.Mock).mockReturnValue("100");
    (liqPriceModule.getLiqPrice as jest.Mock).mockReturnValue({ toBigInt: () => 123 });
    (entryPriceModule.getEntryPrice as jest.Mock).mockReturnValue("10");
  });

  it("should return liquidation price for existing position", async () => {
    const result = await getLiquidationPrice({
      chainId: ChainId.CRONOS_MAINNET,
      triggerExecutionPrice: "10",
      transactionAmount: "100",
      fromToken: mockToken,
      toToken: mockToken,
      isLongPosition: true,
      collateralTokenInfo: mockToken,
      existingPosition: mockPosition,
      orderType: OrderType.Market,
      leverageRatio: 10,
      caches: mockCaches,
    });
    expect(result).toBe(123);
  });

  it("should return liquidation price for new position (no existingPosition)", async () => {
    const result = await getLiquidationPrice({
      chainId: ChainId.CRONOS_MAINNET,
      triggerExecutionPrice: "10",
      transactionAmount: "100",
      fromToken: mockToken,
      toToken: mockToken,
      isLongPosition: true,
      collateralTokenInfo: mockToken,
      existingPosition: undefined,
      orderType: OrderType.Market,
      leverageRatio: 10,
      caches: mockCaches,
    });
    expect(result).toBe(123);
  });
});
