import { getIsClosing } from "../../../src/positions/utils/getIsClosing";
import * as parseValueModule from "../../../src/utils/numbers/parseValue";
import * as getIsFullCloseModule from "../../../src/orders/getIsFullClose";
import { Position } from "../../../src/types/position";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../../src/utils/numbers/parseValue");
jest.mock("../../../src/orders/getIsFullClose");

describe("getIsClosing", () => {
  const position: Position = {
    key: "key",
    collateralToken: "0x0",
    indexToken: "0x0",
    isLong: true,
    size: BigNumber.from(1000),
    collateral: BigNumber.from(500),
    averagePrice: BigNumber.from(2000),
    entryFundingRate: BigNumber.from(0),
    hasRealisedProfit: false,
    realisedPnl: BigNumber.from(0),
    lastIncreasedTime: 0,
    hasProfit: true,
    delta: BigNumber.from(0),
    cumulativeFundingRate: BigNumber.from(0),
    fundingFee: BigNumber.from(10),
    collateralAfterFee: BigNumber.from(0),
    closingFee: BigNumber.from(0),
    positionFee: BigNumber.from(0),
    totalFees: BigNumber.from(0),
    pendingDelta: BigNumber.from(0),
    hasLowCollateral: false,
    markPrice: BigNumber.from(2100),
    deltaPercentage: BigNumber.from(0),
    hasProfitAfterFees: false,
    pendingDeltaAfterFees: BigNumber.from(0),
    deltaPercentageAfterFees: BigNumber.from(0),
    netValue: BigNumber.from(0),
    netValueAfterFees: BigNumber.from(0),
    leverage: BigNumber.from(0),
    liqPrice: BigNumber.from(0),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (parseValueModule.parseValue as jest.Mock).mockReturnValue(BigNumber.from(123));
    (getIsFullCloseModule.getIsFullClose as jest.Mock).mockReturnValue(true);
  });

  it("calls parseValue and getIsFullClose with correct arguments and returns the result", () => {
    const result = getIsClosing("456", position);
    expect(parseValueModule.parseValue).toHaveBeenCalledWith("456", expect.any(Number));
    expect(getIsFullCloseModule.getIsFullClose).toHaveBeenCalledWith(position, { sizeDelta: BigNumber.from(123) });
    expect(result).toBe(true);
  });

  it("returns false if getIsFullClose returns false", () => {
    (getIsFullCloseModule.getIsFullClose as jest.Mock).mockReturnValue(false);
    const result = getIsClosing("789", position);
    expect(result).toBe(false);
  });
});
