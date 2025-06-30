import { BigNumber } from "@ethersproject/bignumber";
import { getNextAveragePrice } from "../../../../src/trade/paramsValidation/takeProfitStopLoss/getNextAveragePrice";
import * as entryPriceModule from "../../../../src/trade/utils/entryPrice";
import * as toUsdMaxModule from "../../../../src/trade/utils/toValue";
import * as positionUtil from "../../../../src/utils/position";
import { ChainId } from "../../../../src/types/chain";
import { OrderType } from "../../../../src/trade/orders/types/orderType";
import { TokenInfo } from "../../../../src/types/tokens";
import { Position } from "../../../../src/types/position";

jest.mock("../../../../src/trade/utils/entryPrice");
jest.mock("../../../../src/trade/utils/toValue");
jest.mock("../../../../src/utils/position");

describe("getNextAveragePrice", () => {
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

  const mockCaches = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
    (entryPriceModule.getEntryPrice as jest.Mock).mockReturnValue(BigNumber.from(123));
    (toUsdMaxModule.getToUsdMax as jest.Mock).mockResolvedValue(BigNumber.from(456));
    (positionUtil.getNextAveragePrice as jest.Mock).mockReturnValue(BigNumber.from(789));
  });

  it("returns undefined if existingPosition is not provided", async () => {
    const result = await getNextAveragePrice({
      chainId: ChainId.CRONOS_MAINNET,
      fromTokenInfo: mockToken,
      fromAmount: BigNumber.from(100),
      toTokenInfo: mockToken,
      orderType: OrderType.Market,
      isLong: true,
      collateralTokenInfo: mockToken,
      leverage: 10,
      triggerExecutionPrice: "10",
      existingPosition: undefined,
      caches: mockCaches,
    });
    expect(result).toBeUndefined();
  });

  it("returns new average price if existingPosition is provided", async () => {
    const result = await getNextAveragePrice({
      chainId: ChainId.CRONOS_MAINNET,
      fromTokenInfo: mockToken,
      fromAmount: BigNumber.from(100),
      toTokenInfo: mockToken,
      orderType: OrderType.Market,
      isLong: true,
      collateralTokenInfo: mockToken,
      leverage: 10,
      triggerExecutionPrice: "10",
      existingPosition: mockPosition,
      caches: mockCaches,
    });
    expect(result).toEqual(BigNumber.from(789));
    expect(entryPriceModule.getEntryPrice).toHaveBeenCalled();
    expect(toUsdMaxModule.getToUsdMax).toHaveBeenCalled();
    expect(positionUtil.getNextAveragePrice).toHaveBeenCalled();
  });
});
