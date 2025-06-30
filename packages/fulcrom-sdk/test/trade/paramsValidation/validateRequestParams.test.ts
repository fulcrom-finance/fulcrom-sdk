import { validateIncreaseOrderParams as validateRequestParams } from "../../../src/trade/paramsValidation/validateRequestParams";
import { OrderType } from "../../../src/trade/orders/types/orderType";

describe("validateRequestParams", () => {
  it("returns [] for valid params", () => {
    const params = {
      account: "0x1234567890123456789012345678901234567890",
      chainId: 25,
      orderType: OrderType.Limit,
      isLongPosition: true,
      fromToken: { symbol: "BTC" },
      toToken: { symbol: "ETH" },
      transactionAmount: "100",
      leverageRatio: 5,
      sourceTokenSymbol: "BTC",
      targetTokenSymbol: "ETH",
      collateralTokenInfo: { symbol: "BTC" },
      caches: new Map(),
    };
    expect(validateRequestParams(params)).toEqual([]);
  });

  it("returns error if account is missing", () => {
    const params = {
      chainId: 25,
      orderType: OrderType.Limit,
      isLongPosition: true,
      fromToken: { symbol: "BTC" },
      toToken: { symbol: "ETH" },
      transactionAmount: "100",
      leverageRatio: 5,
      sourceTokenSymbol: "BTC",
      targetTokenSymbol: "ETH",
      collateralTokenInfo: { symbol: "BTC" },
      caches: new Map(),
    };
    const errors = validateRequestParams(params as any);
    expect(errors[0]).toMatch("Invalid account address: undefined");
  });

  it("returns error if chainId is missing", () => {
    const params = {
      account: "0x1234567890123456789012345678901234567890",
      orderType: OrderType.Limit,
      isLongPosition: true,
      fromToken: { symbol: "BTC" },
      toToken: { symbol: "ETH" },
      transactionAmount: "100",
      leverageRatio: 5,
      sourceTokenSymbol: "BTC",
      targetTokenSymbol: "ETH",
      collateralTokenInfo: { symbol: "BTC" },
      caches: new Map(),
    };
    const errors = validateRequestParams(params as any);
    expect(errors[0]).toMatch("Invalid chainId: undefined");
  });

  it("returns error if orderType is missing", () => {
    const params = {
      account: "0x1234567890123456789012345678901234567890",
      chainId: 25,
      isLongPosition: true,
      fromToken: { symbol: "BTC" },
      toToken: { symbol: "ETH" },
      transactionAmount: "100",
      leverageRatio: 5,
      sourceTokenSymbol: "BTC",
      targetTokenSymbol: "ETH",
      collateralTokenInfo: { symbol: "BTC" },
      caches: new Map(),
    };
    const errors = validateRequestParams(params as any);
    expect(errors[0]).toMatch("Invalid orderType: undefined");
  });

  it("returns error if transactionAmount is missing", () => {
    const params = {
      account: "0x1234567890123456789012345678901234567890",
      chainId: 25,
      orderType: OrderType.Limit,
      isLongPosition: true,
      fromToken: { symbol: "BTC" },
      toToken: { symbol: "ETH" },
      leverageRatio: 5,
      sourceTokenSymbol: "BTC",
      targetTokenSymbol: "ETH",
      collateralTokenInfo: { symbol: "BTC" },
      caches: new Map(),
    };
    const errors = validateRequestParams(params as any);
    expect(errors[0]).toMatch("Invalid transactionAmount: undefined, must be a string");
  });
});
