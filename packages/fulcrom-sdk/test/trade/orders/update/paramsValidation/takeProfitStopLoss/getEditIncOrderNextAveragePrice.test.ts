import { getEditIncOrderNextAveragePrice } from "../../../../../../src/trade/orders/update/paramsValidation/takeProfitStopLoss/getEditIncOrderNextAveragePrice";
import * as positionDeltaUtils from "../../../../../../src/orders/getPositionDelta";
import * as nextAvgPriceUtils from "../../../../../../src/utils/position";
import * as parseValueUtils from "../../../../../../src/utils/numbers/parseValue";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../../../../../src/orders/getPositionDelta");
jest.mock("../../../../../../src/utils/position");
jest.mock("../../../../../../src/utils/numbers/parseValue");

const mockOrder = { isLong: true } as any;
const mockPosition = { size: BigNumber.from("1000") } as any;

describe("getEditIncOrderNextAveragePrice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock parseValue to return BigNumber.from(value) for test consistency
    (parseValueUtils.parseValue as jest.Mock).mockImplementation((value: string) => BigNumber.from(value));
  });

  it("returns undefined if position is not provided", () => {
    const result = getEditIncOrderNextAveragePrice(
      mockOrder,
      "100",
      "10",
      undefined
    );
    expect(result).toBeUndefined();
  });

  it("returns next average price when position is provided", () => {
    // Arrange
    const newTriggerPrice = "100";
    const newSizeDelta = "10";
    const position = { size: BigNumber.from("1000") } as any;
    const deltaData = { hasProfit: true, delta: BigNumber.from("50") };
    const expected = BigNumber.from("12345");

    (positionDeltaUtils.getPositionDelta as jest.Mock).mockReturnValue(deltaData);
    (nextAvgPriceUtils.getNextAveragePrice as jest.Mock).mockReturnValue(expected);

    // Act
    const result = getEditIncOrderNextAveragePrice(
      mockOrder,
      newTriggerPrice,
      newSizeDelta,
      position
    );

    // Assert
    expect(positionDeltaUtils.getPositionDelta).toHaveBeenCalledWith(
      BigNumber.from(newTriggerPrice),
      position
    );
    expect(nextAvgPriceUtils.getNextAveragePrice).toHaveBeenCalledWith({
      size: position.size,
      sizeDelta: BigNumber.from(newSizeDelta),
      hasProfit: deltaData.hasProfit,
      delta: deltaData.delta,
      nextPrice: BigNumber.from(newTriggerPrice),
      isLong: mockOrder.isLong,
    });
    expect(result).toEqual(expected);
  });

  it("handles newTriggerPrice = '0' and newSizeDelta = '0'", () => {
    const newTriggerPrice = "0";
    const newSizeDelta = "0";
    const position = { size: BigNumber.from("1000") } as any;
    const deltaData = { hasProfit: false, delta: BigNumber.from("0") };
    const expected = BigNumber.from("999");

    (positionDeltaUtils.getPositionDelta as jest.Mock).mockReturnValue(deltaData);
    (nextAvgPriceUtils.getNextAveragePrice as jest.Mock).mockReturnValue(expected);

    const result = getEditIncOrderNextAveragePrice(
      mockOrder,
      newTriggerPrice,
      newSizeDelta,
      position
    );

    expect(positionDeltaUtils.getPositionDelta).toHaveBeenCalledWith(
      BigNumber.from(newTriggerPrice),
      position
    );
    expect(nextAvgPriceUtils.getNextAveragePrice).toHaveBeenCalledWith({
      size: position.size,
      sizeDelta: BigNumber.from(newSizeDelta),
      hasProfit: deltaData.hasProfit,
      delta: deltaData.delta,
      nextPrice: BigNumber.from(newTriggerPrice),
      isLong: mockOrder.isLong,
    });
    expect(result).toEqual(expected);
  });
});
