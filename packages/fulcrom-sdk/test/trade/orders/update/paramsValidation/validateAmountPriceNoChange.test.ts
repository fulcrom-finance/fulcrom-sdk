import { BigNumber } from "@ethersproject/bignumber";
import { validateAmountPriceNoChange } from "../../../../../src/trade/orders/update/paramsValidation/validateAmountPriceNoChange";
import { OrderType } from "../../../../../src/query/graphql";

describe("validateAmountPriceNoChange", () => {
  const baseAccount = "0xabc";
  const unchangedTriggerPrice = BigNumber.from("1" + "0".repeat(30)); // 1.0 with 30 decimals
  const unchangedSizeDelta = BigNumber.from("5" + "0".repeat(30)); // 5.0 with 30 decimals

  it("returns error if DecreaseOrder price and amount have no change", () => {
    const order = {
      type: OrderType.DecreaseOrder,
      triggerPrice: unchangedTriggerPrice,
      sizeDelta: unchangedSizeDelta,
    } as any;

    const params = {
      order,
      account: baseAccount,
      transactionAmount: "4.999999999999999999999999999999", // 30 decimals, so diff < ONE_USD
      triggerExecutionPrice: "1", // same as triggerPrice (1.0 with 30 decimals)
    } as any;

    const result = validateAmountPriceNoChange(params);
    // Debug: print intermediate values
    const { parseValue } = require("../../../../../src/utils/numbers/parseValue");
    const { USD_DECIMALS } = require("../../../../../src/config");
    const decreaseAmount = parseValue(params.transactionAmount, USD_DECIMALS);
    const diff = order.sizeDelta.sub(decreaseAmount);
    const { ONE_USD } = require("../../../../../src/config");
    const triggerPriceChanged = parseValue(params.triggerExecutionPrice, USD_DECIMALS).eq(order.triggerPrice);
     
    expect(result).toContain("Price and Amount have no change, please input new value");
  });

  it("returns [] if DecreaseOrder price is changed", () => {
    const order = {
      type: OrderType.DecreaseOrder,
      triggerPrice: unchangedTriggerPrice,
      sizeDelta: unchangedSizeDelta,
    } as any;

    const params = {
      order,
      account: baseAccount,
      transactionAmount: "5",
      triggerExecutionPrice: "2", // changed
    } as any;

    const result = validateAmountPriceNoChange(params);
    expect(result).toEqual([]);
  });

  it("returns error if IncreaseOrder price, amount, tp, and sl have no change", () => {
    const order = {
      type: OrderType.IncreaseOrder,
      triggerPrice: unchangedTriggerPrice,
      sizeDelta: unchangedSizeDelta,
      tp: BigNumber.from("2" + "0".repeat(30)), // 2.0 with 30 decimals
      sl: BigNumber.from("9" + "0".repeat(29)), // 0.9 with 30 decimals
    } as any;

    const params = {
      order,
      account: baseAccount,
      transactionAmount: "5", // same as sizeDelta
      triggerExecutionPrice: "1", // same as triggerPrice
      takeProfitTargetPrice: "2", // same as tp (2.0)
      stopLossTriggerPrice: "0.9", // same as sl (0.9)
    } as any;

    const result = validateAmountPriceNoChange(params);
    expect(result).toContain("Price and Amount have no change, please input new value");
  });

  it("returns [] if IncreaseOrder tp is changed", () => {
    const order = {
      type: OrderType.IncreaseOrder,
      triggerPrice: unchangedTriggerPrice,
      sizeDelta: unchangedSizeDelta,
      tp: BigNumber.from("200000000"), // 2.0
      sl: BigNumber.from("90000000"), // 0.9
    } as any;

    const params = {
      order,
      account: baseAccount,
      transactionAmount: "5",
      triggerExecutionPrice: "1",
      takeProfitTargetPrice: "3", // changed
      stopLossTriggerPrice: "0.9",
    } as any;

    const result = validateAmountPriceNoChange(params);
    expect(result).toEqual([]);
  });

  it("returns [] if IncreaseOrder sl is changed", () => {
    const order = {
      type: OrderType.IncreaseOrder,
      triggerPrice: unchangedTriggerPrice,
      sizeDelta: unchangedSizeDelta,
      tp: BigNumber.from("200000000"), // 2.0
      sl: BigNumber.from("90000000"), // 0.9
    } as any;

    const params = {
      order,
      account: baseAccount,
      transactionAmount: "5",
      triggerExecutionPrice: "1",
      takeProfitTargetPrice: "2",
      stopLossTriggerPrice: "1.1", // changed
    } as any;

    const result = validateAmountPriceNoChange(params);
    expect(result).toEqual([]);
  });
});
