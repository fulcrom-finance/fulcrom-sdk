import { validateTakeProfitStopLossPrice } from "../../../../src/trade/paramsValidation/takeProfitStopLoss/validateTakeProfitStopLossPrice";
import * as getPositionModule from "../../../../src/positions/getPosition";
import * as getNextEntryPriceModule from "../../../../src/trade/paramsValidation/takeProfitStopLoss/getNextEntryPrice";
import * as getLiquidationPriceModule from "../../../../src/trade/paramsValidation/takeProfitStopLoss/getLiquidationPrice";
import * as getValidRangeModule from "../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getValidRange";
import * as getErrorMessageModule from "../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getErrorMessage";
import { BigNumber } from "@ethersproject/bignumber";
import { ChainId } from "../../../../src/types/chain";
import { OrderType } from "../../../../src/trade/orders/types/orderType";
import { TokenInfo } from "../../../../src/types/tokens";

jest.mock("../../../../src/positions/getPosition");
jest.mock("../../../../src/trade/paramsValidation/takeProfitStopLoss/getNextEntryPrice");
jest.mock("../../../../src/trade/paramsValidation/takeProfitStopLoss/getLiquidationPrice");
jest.mock("../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getValidRange");
jest.mock("../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getErrorMessage");

describe("validateTakeProfitStopLossPrice", () => {
  const mockToken: TokenInfo = {
    address: "0xToken",
    symbol: "BTC",
    decimals: 18,
    displayDecimals: 2,
    displaySymbol: "BTC",
    name: "Mock Token",
    isStable: false,
    isNative: false,
    minPrice: BigNumber.from(1),
    maxPrice: BigNumber.from(1),
    image: "",
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
    candlePrices: {} as any,
  };

  const mockCaches = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
    (getPositionModule.getPosition as jest.Mock).mockResolvedValue({});
    (getNextEntryPriceModule.getNextEntryPrice as jest.Mock).mockResolvedValue({ toBigInt: () => 100 });
    (getLiquidationPriceModule.getLiquidationPrice as jest.Mock).mockResolvedValue(50);
    (getValidRangeModule.getValidRange as jest.Mock).mockReturnValue([10, 200]);
    (getErrorMessageModule.getErrorMessage as jest.Mock).mockReturnValue(undefined);
  });

  it("should return empty array if takeProfitTargetPrice and stopLossTriggerPrice are valid", async () => {
    const result = await validateTakeProfitStopLossPrice({
      chainId: ChainId.CRONOS_MAINNET,
      account: "0xAccount",
      triggerExecutionPrice: "10",
      transactionAmount: "100",
      fromToken: mockToken,
      toToken: mockToken,
      isLongPosition: true,
      collateralTokenInfo: mockToken,
      orderType: OrderType.Market,
      takeProfitTargetPrice: "150",
      stopLossTriggerPrice: "20",
      leverageRatio: 10,
      caches: mockCaches,
      sourceTokenSymbol: mockToken.symbol,
      targetTokenSymbol: mockToken.symbol,
    });
    expect(result).toEqual([]);
  });

  it("should return error if entryPrice or liquidationPrice is missing", async () => {
    (getNextEntryPriceModule.getNextEntryPrice as jest.Mock).mockResolvedValue(undefined);
    const result = await validateTakeProfitStopLossPrice({
      chainId: ChainId.CRONOS_MAINNET,
      account: "0xAccount",
      triggerExecutionPrice: "10",
      transactionAmount: "100",
      fromToken: mockToken,
      toToken: mockToken,
      isLongPosition: true,
      collateralTokenInfo: mockToken,
      orderType: OrderType.Market,
      takeProfitTargetPrice: "150",
      stopLossTriggerPrice: "20",
      leverageRatio: 10,
      caches: mockCaches,
      sourceTokenSymbol: mockToken.symbol,
      targetTokenSymbol: mockToken.symbol,
    });
    expect(result).toEqual(["Invalid trigger price"]);
  });

  it("should return error message if getErrorMessage returns error for takeProfitTargetPrice", async () => {
    (getErrorMessageModule.getErrorMessage as jest.Mock).mockImplementationOnce(() => "TP error").mockImplementationOnce(() => undefined);
    (getNextEntryPriceModule.getNextEntryPrice as jest.Mock).mockResolvedValue({ toBigInt: () => 100 });
    (getLiquidationPriceModule.getLiquidationPrice as jest.Mock).mockResolvedValue(50);
    const result = await validateTakeProfitStopLossPrice({
      chainId: ChainId.CRONOS_MAINNET,
      account: "0xAccount",
      triggerExecutionPrice: "10",
      transactionAmount: "100",
      fromToken: mockToken,
      toToken: mockToken,
      isLongPosition: true,
      collateralTokenInfo: mockToken,
      orderType: OrderType.Market,
      takeProfitTargetPrice: "150",
      stopLossTriggerPrice: "20",
      leverageRatio: 10,
      caches: mockCaches,
      sourceTokenSymbol: mockToken.symbol,
      targetTokenSymbol: mockToken.symbol,
    });
    expect(result).toEqual(["TP error"]);
  });

  it("should return error message if getErrorMessage returns error for stopLossTriggerPrice", async () => {
    (getErrorMessageModule.getErrorMessage as jest.Mock).mockImplementationOnce(() => undefined).mockImplementationOnce(() => "SL error");
    (getNextEntryPriceModule.getNextEntryPrice as jest.Mock).mockResolvedValue({ toBigInt: () => 100 });
    (getLiquidationPriceModule.getLiquidationPrice as jest.Mock).mockResolvedValue(50);
    const result = await validateTakeProfitStopLossPrice({
      chainId: ChainId.CRONOS_MAINNET,
      account: "0xAccount",
      triggerExecutionPrice: "10",
      transactionAmount: "100",
      fromToken: mockToken,
      toToken: mockToken,
      isLongPosition: true,
      collateralTokenInfo: mockToken,
      orderType: OrderType.Market,
      takeProfitTargetPrice: "150",
      stopLossTriggerPrice: "20",
      leverageRatio: 10,
      caches: mockCaches,
      sourceTokenSymbol: mockToken.symbol,
      targetTokenSymbol: mockToken.symbol,
    });
    expect(result).toEqual(["SL error"]);
  });
});
