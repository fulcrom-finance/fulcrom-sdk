import { BigNumber } from "@ethersproject/bignumber";
import { validateTriggerExecutionPrice } from "../../../src/trade/paramsValidation/validateTriggerExecutionPrice";

// Mock dependencies
jest.mock("../../../src/utils/numbers/parseValue", () => ({
  parseValue: (v: any) => BigNumber.from(v),
}));
jest.mock("../../../src/trade/orders/types/orderType", () => ({
  isLimitOrder: (orderType: string) => orderType === "Limit",
  isStopMarket: (orderType: string) => orderType === "StopMarket",
}));

const baseParams = {
  orderType: "Limit",
  isLongPosition: true,
  toToken: {
    maxPrice: BigNumber.from(100),
    minPrice: BigNumber.from(90),
  },
};

describe("validateTriggerExecutionPrice", () => {
  it("returns [] if not limit or stop market order", () => {
    const params = { ...baseParams, orderType: "Market" };
    expect(validateTriggerExecutionPrice(params as any)).toEqual([]);
  });

  it("returns error if triggerExecutionPrice is missing", () => {
    const params = { ...baseParams };
    delete (params as any).triggerExecutionPrice;
    expect(validateTriggerExecutionPrice(params as any)).toEqual([
      "triggerExecutionPrice is required",
    ]);
  });

  it("returns error if triggerExecutionPrice <= 0", () => {
    const params = { ...baseParams, triggerExecutionPrice: 0 };
    const result = validateTriggerExecutionPrice(params as any)[0]
    expect(result).toContain(
      "triggerExecutionPrice is required"
    );
  });

  it("returns error for long limit order if trigger price > market", () => {
    const params = {
      ...baseParams,
      triggerExecutionPrice: 150,
      isLongPosition: true,
      orderType: "Limit",
      toToken: { maxPrice: BigNumber.from(100), minPrice: BigNumber.from(90) },
    };
    expect(validateTriggerExecutionPrice(params as any)).toContain(
      "triggerExecutionPrice needs to be below market price"
    );
  });

  it("returns error for short limit order if trigger price < market", () => {
    const params = {
      ...baseParams,
      triggerExecutionPrice: 80,
      isLongPosition: false,
      orderType: "Limit",
      toToken: { maxPrice: BigNumber.from(100), minPrice: BigNumber.from(90) },
    };
    expect(validateTriggerExecutionPrice(params as any)).toContain(
      "triggerExecutionPrice needs to be above market price"
    );
  });

  it("returns error for long stop market order if trigger price < market", () => {
    const params = {
      ...baseParams,
      triggerExecutionPrice: 80,
      isLongPosition: true,
      orderType: "StopMarket",
      toToken: { maxPrice: BigNumber.from(100), minPrice: BigNumber.from(90) },
    };
    expect(validateTriggerExecutionPrice(params as any)).toContain(
      "triggerExecutionPrice needs to be above market price"
    );
  });

  it("returns error for short stop market order if trigger price > market", () => {
    const params = {
      ...baseParams,
      triggerExecutionPrice: 120,
      isLongPosition: false,
      orderType: "StopMarket",
      toToken: { maxPrice: BigNumber.from(100), minPrice: BigNumber.from(90) },
    };
    expect(validateTriggerExecutionPrice(params as any)).toContain(
      "triggerExecutionPrice needs to be below market price"
    );
  });

  it("returns [] for valid long limit order (trigger price < market)", () => {
    const params = {
      ...baseParams,
      triggerExecutionPrice: 90,
      isLongPosition: true,
      orderType: "Limit",
      toToken: { maxPrice: BigNumber.from(100), minPrice: BigNumber.from(90) },
    };
    expect(validateTriggerExecutionPrice(params as any)).toEqual([]);
  });

  it("returns [] for valid short limit order (trigger price > market)", () => {
    const params = {
      ...baseParams,
      triggerExecutionPrice: 110,
      isLongPosition: false,
      orderType: "Limit",
      toToken: { maxPrice: BigNumber.from(100), minPrice: BigNumber.from(90) },
    };
    expect(validateTriggerExecutionPrice(params as any)).toEqual([]);
  });

  it("returns [] for valid long stop market order (trigger price > market)", () => {
    const params = {
      ...baseParams,
      triggerExecutionPrice: 120,
      isLongPosition: true,
      orderType: "StopMarket",
      toToken: { maxPrice: BigNumber.from(100), minPrice: BigNumber.from(90) },
    };
    expect(validateTriggerExecutionPrice(params as any)).toEqual([]);
  });

  it("returns [] for valid short stop market order (trigger price < market)", () => {
    const params = {
      ...baseParams,
      triggerExecutionPrice: 80,
      isLongPosition: false,
      orderType: "StopMarket",
      toToken: { maxPrice: BigNumber.from(100), minPrice: BigNumber.from(90) },
    };
    expect(validateTriggerExecutionPrice(params as any)).toEqual([]);
  });
});
