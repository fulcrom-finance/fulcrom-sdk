import { getErrorMessage, InputType } from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getErrorMessage";
import * as parseValueUtils from "../../../../../../src/utils/numbers/parseValue";
import * as formatUtils from "../../../../../../src/utils/numbers/formatAmountUsdTokenPrice";
import { BigNumber } from "@ethersproject/bignumber";
describe("getErrorMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(parseValueUtils, "parseValue").mockImplementation(
      (v: string, _d: number, _def?: BigNumber) => BigNumber.from(v)
    );
    jest.spyOn(formatUtils, "formatAmountUsdTokenPrice").mockImplementation((v: any) => `formatted(${typeof v === "bigint" ? v : v.toString()})`);
  });

  it("returns error if price is below min", () => {
    const validRange: [bigint, bigint] = [BigInt("100"), BigInt("200")];
    const price = "50";
    const type = InputType.STOP_LOSS;
    const result = getErrorMessage({ validRange, price, type });
    expect(result).toBe("Please input stop loss price that greater than formatted(100) and lesser than formatted(200)");
  });

  it("returns error if price is above max", () => {
    const validRange: [bigint, bigint] = [BigInt("100"), BigInt("200")];
    const price = "250";
    const type = InputType.TAKE_PROFIT;
    const result = getErrorMessage({ validRange, price, type });
    expect(result).toBe("Please input take profit price that greater than formatted(100) and lesser than formatted(200)");
  });

  it("returns undefined if price is within range", () => {
    const validRange: [bigint, bigint] = [BigInt("100"), BigInt("200")];
    const price = "150";
    const type = InputType.STOP_LOSS;
    const result = getErrorMessage({ validRange, price, type });
    expect(result).toBeUndefined();
  });

  it("returns error if price is below min and max is null", () => {
    const validRange: [bigint, null] = [BigInt("100"), null];
    const price = "50";
    const type = InputType.TAKE_PROFIT;
    const result = getErrorMessage({ validRange, price, type });
    expect(result).toBe("Please input take profit price greater than formatted(100)");
  });

  it("returns undefined if price is above min and max is null", () => {
    const validRange: [bigint, null] = [BigInt("100"), null];
    const price = "150";
    const type = InputType.TAKE_PROFIT;
    const result = getErrorMessage({ validRange, price, type });
    expect(result).toBeUndefined();
  });
});
