import { BigNumber } from "@ethersproject/bignumber";
import { validateTPSLPrice } from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/validateTPSLPrice";
import * as priceUtils from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getEditIncOrderNextEntryPrice";
import * as liqUtils from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getEditIncOrderLiqPrice";
import * as rangeUtils from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getValidRange";
import * as errorUtils from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getErrorMessage";
import { InputType } from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getErrorMessage";

describe("validateTPSLPrice", () => {
  const baseOrder = {
    isLong: true,
    // ...other IncreaseOrder fields as needed
  } as any;

  const baseTokenInfo = {} as any;
  const basePosition = {} as any;
  const baseCaches = new Map();

  const baseParams = {
    chainId: 25,
    order: baseOrder,
    triggerExecutionPrice: "1",
    transactionAmount: "1",
    purchaseTokenInfo: baseTokenInfo,
    takeProfitTargetPrice: "2",
    stopLossTriggerPrice: "0.9",
    position: basePosition,
    caches: baseCaches,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error if entry or liq price is missing", async () => {
    jest.spyOn(priceUtils, "getEditIncOrderNextEntryPrice").mockReturnValue(undefined);
    jest.spyOn(liqUtils, "getEditIncOrderLiqPrice").mockResolvedValue(BigInt("100"));

    const result = await validateTPSLPrice(baseParams);
    expect(result).toEqual(["Invalid trigger price"]);

    jest.spyOn(priceUtils, "getEditIncOrderNextEntryPrice").mockReturnValue(BigNumber.from("100"));
    jest.spyOn(liqUtils, "getEditIncOrderLiqPrice").mockResolvedValue(undefined);

    const result2 = await validateTPSLPrice(baseParams);
    expect(result2).toEqual(["Invalid trigger price"]);
  });

  it("returns error if TP/SL is invalid", async () => {
    jest.spyOn(priceUtils, "getEditIncOrderNextEntryPrice").mockReturnValue(BigNumber.from("100"));
    jest.spyOn(liqUtils, "getEditIncOrderLiqPrice").mockResolvedValue(BigInt("50"));
    jest.spyOn(rangeUtils, "getValidRange").mockReturnValue([BigInt("90"), BigInt("110")]);
    jest.spyOn(errorUtils, "getErrorMessage").mockImplementation(({ type }) =>
      type === InputType.TAKE_PROFIT ? "TP error" : "SL error"
    );

    const result = await validateTPSLPrice(baseParams);
    expect(result).toContain("TP error");
    expect(result).toContain("SL error");
  });

  it("returns [] if TP/SL are valid", async () => {
    jest.spyOn(priceUtils, "getEditIncOrderNextEntryPrice").mockReturnValue(BigNumber.from("100"));
    jest.spyOn(liqUtils, "getEditIncOrderLiqPrice").mockResolvedValue(BigInt("50"));
    jest.spyOn(rangeUtils, "getValidRange").mockReturnValue([BigInt("90"), BigInt("110")]);
    jest.spyOn(errorUtils, "getErrorMessage").mockReturnValue(undefined);

    const result = await validateTPSLPrice(baseParams);
    expect(result).toEqual([]);
  });
});
