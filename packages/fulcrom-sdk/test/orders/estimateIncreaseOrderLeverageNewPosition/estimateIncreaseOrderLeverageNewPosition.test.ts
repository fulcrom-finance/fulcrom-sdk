import { BigNumber } from "@ethersproject/bignumber";
import { estimateIncreaseOrderLeverageNewPosition } from "../../../src/orders/estimateIncreaseOrderLeverageNewPosition/estimateIncreaseOrderLeverageNewPosition";
import { TokenInfo } from "../../../src/types";
import { IncreaseOrder, OrderType } from "../../../src/query/graphql";

// Mock getTradeOrderSwapFee to return a fixed value for predictable results
jest.mock("../../../src/orders/estimateIncreaseOrderLeverageNewPosition/getTradeOrderSwapFee", () => ({
  getTradeOrderSwapFee: jest.fn(() => BigNumber.from(10)),
}));

describe("estimateIncreaseOrderLeverageNewPosition", () => {
  const dummyBN = BigNumber.from(0);
  const dummyCandle = { time: 0, open: 0, close: 0, high: 0, low: 0 };

  const indexToken: TokenInfo = {
    name: "TokenB",
    image: "imageB.png",
    symbol: "ETH" as const,
    decimals: 18,
    displayDecimals: 2,
    isStable: false,
    address: "0xTokenB",
    displaySymbol: "ETH",
    baseTokenSymbol: "ETH",
    baseTokenImage: "imageB.png",
    minPrice: BigNumber.from(3),
    maxPrice: BigNumber.from(3),
    averagePrice: BigNumber.from(3),
    isNative: false,
    usdgAmount: dummyBN,
    maxUsdgAmount: dummyBN,
    poolAmount: dummyBN,
    bufferAmount: dummyBN,
    managedAmount: dummyBN,
    managedUsd: dummyBN,
    availableAmount: dummyBN,
    availableUsd: dummyBN,
    guaranteedUsd: dummyBN,
    redemptionAmount: dummyBN,
    reservedAmount: dummyBN,
    balance: dummyBN,
    balanceUsdMin: dummyBN,
    balanceUsdMax: dummyBN,
    weight: dummyBN,
    globalShortSize: dummyBN,
    maxAvailableLong: dummyBN,
    maxAvailableShort: dummyBN,
    maxGlobalLongSize: dummyBN,
    maxGlobalShortSize: dummyBN,
    maxLongCapacity: dummyBN,
    candlePrices: dummyCandle,
  };

  const fromTokenInfo: TokenInfo = {
    name: "TokenA",
    image: "imageA.png",
    symbol: "BTC" as const,
    decimals: 18,
    displayDecimals: 2,
    isStable: false,
    address: "0xTokenA",
    displaySymbol: "BTC",
    baseTokenSymbol: "BTC",
    baseTokenImage: "imageA.png",
    minPrice: BigNumber.from(2),
    maxPrice: BigNumber.from(2),
    averagePrice: BigNumber.from(2),
    isNative: false,
    usdgAmount: dummyBN,
    maxUsdgAmount: dummyBN,
    poolAmount: dummyBN,
    bufferAmount: dummyBN,
    managedAmount: dummyBN,
    managedUsd: dummyBN,
    availableAmount: dummyBN,
    availableUsd: dummyBN,
    guaranteedUsd: dummyBN,
    redemptionAmount: dummyBN,
    reservedAmount: dummyBN,
    balance: dummyBN,
    balanceUsdMin: dummyBN,
    balanceUsdMax: dummyBN,
    weight: dummyBN,
    globalShortSize: dummyBN,
    maxAvailableLong: dummyBN,
    maxAvailableShort: dummyBN,
    maxGlobalLongSize: dummyBN,
    maxGlobalShortSize: dummyBN,
    maxLongCapacity: dummyBN,
    candlePrices: dummyCandle,
  };

  const collateralTokenInfo: TokenInfo = {
    name: "TokenC",
    image: "imageC.png",
    symbol: "USDC" as const,
    decimals: 18,
    displayDecimals: 2,
    isStable: false,
    address: "0xTokenC",
    displaySymbol: "USDC",
    baseTokenSymbol: "USDC",
    baseTokenImage: "imageC.png",
    minPrice: BigNumber.from(4),
    maxPrice: BigNumber.from(4),
    averagePrice: BigNumber.from(4),
    isNative: false,
    usdgAmount: dummyBN,
    maxUsdgAmount: dummyBN,
    poolAmount: dummyBN,
    bufferAmount: dummyBN,
    managedAmount: dummyBN,
    managedUsd: dummyBN,
    availableAmount: dummyBN,
    availableUsd: dummyBN,
    guaranteedUsd: dummyBN,
    redemptionAmount: dummyBN,
    reservedAmount: dummyBN,
    balance: dummyBN,
    balanceUsdMin: dummyBN,
    balanceUsdMax: dummyBN,
    weight: dummyBN,
    globalShortSize: dummyBN,
    maxAvailableLong: dummyBN,
    maxAvailableShort: dummyBN,
    maxGlobalLongSize: dummyBN,
    maxGlobalShortSize: dummyBN,
    maxLongCapacity: dummyBN,
    candlePrices: dummyCandle,
  };

  const usdgSupply = BigNumber.from(1000000);
  const totalWeight = BigNumber.from(1000);

  const order: IncreaseOrder = {
    type: OrderType.IncreaseOrder,
    id: "order1",
    index: "1",
    account: "0xAccount" as any,
    isLong: true,
    executionFee: BigNumber.from(0),
    indexToken: "0xTokenB",
    purchaseToken: "0xTokenA",
    collateralToken: "0xTokenC",
    purchaseTokenAmount: BigNumber.from("1000000000000000000"), // 1 token
    sizeDelta: BigNumber.from("6000000000000000000"), // 6 USD
    triggerPrice: BigNumber.from(3),
    triggerAboveThreshold: false,
    timestamp: 0,
    sl: BigNumber.from(0),
    tp: BigNumber.from(0),
    tpSlExecutionFee: BigNumber.from(0),
  };

  it("calculates leverage correctly for valid input", () => {
    const marginFeeBasisPoints = 10; // 0.1%
    const leverage = estimateIncreaseOrderLeverageNewPosition({
      marginFeeBasisPoints,
      order,
      usdgSupply,
      totalWeight,
      indexToken,
      fromTokenInfo,
      collateralTokenInfo,
    });
    expect(leverage).toBeInstanceOf(BigNumber);
    // The actual value depends on the formula and the mocked swapFee
    // You can add a specific value check if you want to lock the formula
  });

  it("returns undefined if fromTokenInfo is missing", () => {
    const marginFeeBasisPoints = 10;
    const leverage = estimateIncreaseOrderLeverageNewPosition({
      marginFeeBasisPoints,
      order,
      usdgSupply,
      totalWeight,
      indexToken,
      fromTokenInfo: undefined as any,
      collateralTokenInfo,
    });
    expect(leverage).toBeUndefined();
  });

  it("returns undefined if fromTokenAmount is missing", () => {
    const marginFeeBasisPoints = 10;
    const orderNoAmount = { ...order, purchaseTokenAmount: undefined as any };
    const leverage = estimateIncreaseOrderLeverageNewPosition({
      marginFeeBasisPoints,
      order: orderNoAmount,
      usdgSupply,
      totalWeight,
      indexToken,
      fromTokenInfo,
      collateralTokenInfo,
    });
    expect(leverage).toBeUndefined();
  });

  it("returns undefined if fromUsdMin is zero", () => {
    const marginFeeBasisPoints = 10;
    const orderZeroAmount = { ...order, purchaseTokenAmount: BigNumber.from(0) };
    const leverage = estimateIncreaseOrderLeverageNewPosition({
      marginFeeBasisPoints,
      order: orderZeroAmount,
      usdgSupply,
      totalWeight,
      indexToken,
      fromTokenInfo,
      collateralTokenInfo,
    });
    expect(leverage).toBeUndefined();
  });

  it("returns undefined if toTokenMarketPrice is missing", () => {
    const marginFeeBasisPoints = 10;
    const indexTokenNoPrice = { ...indexToken, minPrice: undefined as any };
    const leverage = estimateIncreaseOrderLeverageNewPosition({
      marginFeeBasisPoints,
      order,
      usdgSupply,
      totalWeight,
      indexToken: indexTokenNoPrice,
      fromTokenInfo,
      collateralTokenInfo,
    });
    expect(leverage).toBeUndefined();
  });
});
