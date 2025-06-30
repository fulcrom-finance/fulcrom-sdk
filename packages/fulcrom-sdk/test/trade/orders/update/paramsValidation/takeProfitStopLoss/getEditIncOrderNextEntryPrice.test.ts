import { getEditIncOrderNextEntryPrice } from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getEditIncOrderNextEntryPrice";
import * as avgPriceUtils from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getEditIncOrderNextAveragePrice";
import { BigNumber } from "ethers";

jest.mock("../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getEditIncOrderNextAveragePrice");

const mockOrder = {} as any;
const mockPosition = {} as any;

describe("getEditIncOrderNextEntryPrice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns next average price if position exists and triggerPrice > 0", () => {
    // Arrange
    const newTriggerPrice = "100";
    const newSizeDelta = "10";
    const expected = BigNumber.from("12345");
    (avgPriceUtils.getEditIncOrderNextAveragePrice as jest.Mock).mockReturnValue(expected);

    // Act
    const result = getEditIncOrderNextEntryPrice(
      mockOrder,
      newTriggerPrice,
      newSizeDelta,
      mockPosition
    );

    // Assert
    expect(avgPriceUtils.getEditIncOrderNextAveragePrice).toHaveBeenCalledWith(
      mockOrder,
      newTriggerPrice,
      newSizeDelta,
      mockPosition
    );
    expect(result).toEqual(expected);
  });

  it("returns entry price if position does not exist", () => {
    const newTriggerPrice = "100";
    const newSizeDelta = "10";
    const result = getEditIncOrderNextEntryPrice(
      mockOrder,
      newTriggerPrice,
      newSizeDelta,
      undefined
    );
    // parseValue("100", USD_DECIMALS) should be equal to BigNumber.from("100") for test purposes
    expect(result!.toString()).toEqual("100000000000000000000000000000000");
  });

  it("returns entry price if triggerPrice is 0, even if position exists", () => {
    const newTriggerPrice = "0";
    const newSizeDelta = "10";
    const result = getEditIncOrderNextEntryPrice(
      mockOrder,
      newTriggerPrice,
      newSizeDelta,
      mockPosition
    );
    expect(result!.toString()).toEqual("0");
  });
});
