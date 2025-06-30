import { BigNumber } from "@ethersproject/bignumber";
import { getTradeOrderSwapFee } from "../../../src/orders/estimateIncreaseOrderLeverageNewPosition/getTradeOrderSwapFee";

// Mock getMaxSwapFeeBps to return a fixed value
jest.mock("../../../src/trade/utils/maxSwapFeeBps", () => ({
  getMaxSwapFeeBps: jest.fn(() => 30), // 0.3%
}));

const BASIS_POINTS_DIVISOR = 10000;

describe("getTradeOrderSwapFee", () => {
  const baseOrder = {
    isLong: true,
    purchaseTokenAmount: BigNumber.from(1000),
    purchaseToken: "0xTokenA",
    indexToken: "0xTokenB",
    collateralToken: "0xTokenC",
  };

  const dummyCandle = { time: 0, open: 0, close: 0, high: 0, low: 0 };
  const dummyBN = BigNumber.from(0);

  const purchaseTokenInfo = {
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

  const toTokenInfo = {
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

  const collateralTokenInfo = {
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

  it("returns 0 fee if no swap is needed (purchaseToken == toToken for long)", () => {
    const order = { ...baseOrder, isLong: true };
    const result = getTradeOrderSwapFee({
      order,
      usdgSupply,
      totalWeight,
      toTokenInfo: purchaseTokenInfo, // same address as purchaseToken
      purchaseTokenInfo,
      collateralTokenInfo,
    });
    expect(result.toString()).toBe("0");
  });

  it("returns correct fee if swap is needed (purchaseToken != toToken for long)", () => {
    const order = { ...baseOrder, isLong: true };
    const result = getTradeOrderSwapFee({
      order,
      usdgSupply,
      totalWeight,
      toTokenInfo,
      purchaseTokenInfo,
      collateralTokenInfo,
    });
    // fromUsdMin = purchaseTokenAmount * minPrice / 10^decimals
    // = 1000 * 2 / 10^18 = 2000 / 10^18
    // fee = fromUsdMin * 30 / 10000 = (2000 * 30) / (10^18 * 10000)
    const fromUsdMin = baseOrder.purchaseTokenAmount.mul(purchaseTokenInfo.minPrice).div(BigNumber.from(10).pow(purchaseTokenInfo.decimals));
    const expectedFee = fromUsdMin.mul(30).div(BASIS_POINTS_DIVISOR);
    expect(result.toString()).toBe(expectedFee.toString());
  });

  it("returns correct fee if swap is needed for short (purchaseToken != collateralToken)", () => {
    const order = { ...baseOrder, isLong: false };
    const result = getTradeOrderSwapFee({
      order,
      usdgSupply,
      totalWeight,
      toTokenInfo,
      purchaseTokenInfo,
      collateralTokenInfo,
    });
    // fromUsdMin = purchaseTokenAmount * minPrice / 10^decimals
    // = 1000 * 2 / 10^18 = 2000 / 10^18
    // fee = fromUsdMin * 30 / 10000 = (2000 * 30) / (10^18 * 10000)
    const fromUsdMin = baseOrder.purchaseTokenAmount.mul(purchaseTokenInfo.minPrice).div(BigNumber.from(10).pow(purchaseTokenInfo.decimals));
    const expectedFee = fromUsdMin.mul(30).div(BASIS_POINTS_DIVISOR);
    expect(result.toString()).toBe(expectedFee.toString());
  });

  it("returns 0 fee if no swap is needed for short (purchaseToken == collateralToken)", () => {
    const order = { ...baseOrder, isLong: false, purchaseToken: "0xTokenC" };
    const purchaseTokenInfoShort = { ...purchaseTokenInfo, address: "0xTokenC", symbol: "USDC" as const, name: "TokenC", image: "imageC.png", displaySymbol: "USDC", baseTokenSymbol: "USDC", baseTokenImage: "imageC.png", minPrice: BigNumber.from(4), maxPrice: BigNumber.from(4), averagePrice: BigNumber.from(4) };
    const result = getTradeOrderSwapFee({
      order,
      usdgSupply,
      totalWeight,
      toTokenInfo,
      purchaseTokenInfo: purchaseTokenInfoShort,
      collateralTokenInfo,
    });
    expect(result.toString()).toBe("0");
  });
});
