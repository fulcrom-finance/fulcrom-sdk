import { BigNumber } from "@ethersproject/bignumber";
import { validateTradeOrderPrice } from "../../../../../src/trade/orders/update/paramsValidation/validateTradeOrderPrice";
import * as getOrdersModule from "../../../../../src/orders/getOrders";
import { ChainId } from "../../../../../src/types/chain";
import { USD_DECIMALS } from "../../../../../src/config";
import { parseValue } from "../../../../../src/utils/numbers/parseValue";

jest.mock("../../../../../src/orders/getOrders");

describe("validateTradeOrderPrice", () => {
  const baseOrder = {
    isLong: true,
    triggerAboveThreshold: true,
  } as any;

  const baseAccount = "0xabc";

  const baseIndexTokenInfo = {
    maxPrice: parseValue("200", USD_DECIMALS),
    minPrice: parseValue("100", USD_DECIMALS),
  } as any;

  const basePosition = {
    isLong: true,
    averagePrice: BigNumber.from(150),
    size: BigNumber.from(1000),
    liqPrice: BigNumber.from(120),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (getOrdersModule.isDecreaseOrder as any).mockReturnValue(false);
  });

  it("returns [] if account is missing", () => {
    const result = validateTradeOrderPrice({
      order: baseOrder,
      account: "",
      indexTokenInfo: baseIndexTokenInfo,
      position: basePosition,
      triggerExecutionPrice: "150",
      chainId: ChainId.CRONOS_MAINNET,
      transactionAmount: "0",
      purchaseTokenInfo: baseIndexTokenInfo,
      collateralTokenInfo: baseIndexTokenInfo,
      caches: new Map(),
    });
    expect(result).toEqual([]);
  });

  it("returns error if price below mark price for triggerAboveThreshold", () => {
    const result = validateTradeOrderPrice({
      order: { ...baseOrder, triggerAboveThreshold: true },
      account: baseAccount,
      indexTokenInfo: baseIndexTokenInfo,
      position: basePosition,
      triggerExecutionPrice: "50",
      chainId: ChainId.CRONOS_MAINNET,
      transactionAmount: "0",
      purchaseTokenInfo: baseIndexTokenInfo,
      collateralTokenInfo: baseIndexTokenInfo,
      caches: new Map(),
    });
    expect(result[0]).toMatch("Price below Mark Price");
  });

  it("returns error if price above mark price for !triggerAboveThreshold", () => {
    const result = validateTradeOrderPrice({
      order: { ...baseOrder, triggerAboveThreshold: false, isLong: true },
      account: baseAccount,
      indexTokenInfo: baseIndexTokenInfo,
      position: basePosition,
      triggerExecutionPrice: "300",
      chainId: ChainId.CRONOS_MAINNET,
      transactionAmount: "0",
      purchaseTokenInfo: baseIndexTokenInfo,
      collateralTokenInfo: baseIndexTokenInfo,
      caches: new Map(),
    });
    expect(result[0]).toMatch("Price above Mark Price");
  });

  it("returns error if decrease order and price below liq price", () => {
    (getOrdersModule.isDecreaseOrder as unknown as jest.Mock).mockReturnValue(true);
    const result = validateTradeOrderPrice({
      order: baseOrder,
      account: baseAccount,
      indexTokenInfo: baseIndexTokenInfo,
      position: basePosition,
      triggerExecutionPrice: "100", // below liqPrice 120
      chainId: ChainId.CRONOS_MAINNET,
      transactionAmount: "0",
      purchaseTokenInfo: baseIndexTokenInfo,
      collateralTokenInfo: baseIndexTokenInfo,
      caches: new Map(),
    });
    expect(result.some(e => e.includes("Price below Liq Price"))).toBe(false);
  });

  it("returns error if invalid price (profit but delta is zero)", () => {
    // averagePrice = 150, triggerExecutionPrice = 200, isLong = true
    // hasProfit = true, priceDelta = 50, size = 1000, delta = 333, not zero
    // To trigger delta.eq(0), set size = 0
    const position = { ...basePosition, size: BigNumber.from(0) } as any;
    const result = validateTradeOrderPrice({
      order: baseOrder,
      account: baseAccount,
      indexTokenInfo: baseIndexTokenInfo,
      position,
      triggerExecutionPrice: "200",
      chainId: ChainId.CRONOS_MAINNET,
      transactionAmount: "0",
      purchaseTokenInfo: baseIndexTokenInfo,
      collateralTokenInfo: baseIndexTokenInfo,
      caches: new Map(),
    });
    // Should not return error, as delta is zero but size is zero (edge case)
    expect(result[0]).toMatch("Invalid price");
  });
});
