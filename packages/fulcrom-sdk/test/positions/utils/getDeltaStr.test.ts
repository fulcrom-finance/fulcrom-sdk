import { BigNumber } from "@ethersproject/bignumber";
import {
  getDeltaStr,
  getDeltaBeforeFeesStr,
  getDeltaAfterFeesStr,
} from "../../../src/positions/utils/getDeltaStr";
import * as formatAmountUsdModule from "../../../src/utils/numbers/formatAmountUsd";
import * as formatAmountModule from "../../../src/utils/numbers/formatAmount";
import { Position } from "../../../src/types/position";

jest.mock("../../../src/utils/numbers/formatAmountUsd");
jest.mock("../../../src/utils/numbers/formatAmount");

describe("getDeltaStr", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (formatAmountUsdModule.formatAmountUsd as jest.Mock).mockImplementation((v) => `usd(${v.toString()})`);
    (formatAmountModule.formatAmount as jest.Mock).mockImplementation((v) => `amt(${v.toString()})`);
  });

  it("returns zero strings and undefined color when delta is 0", () => {
    const result = getDeltaStr({
      delta: BigNumber.from(0),
      deltaPercentage: BigNumber.from(0),
      hasProfit: true,
    });
    expect(result).toEqual({
      deltaStr: "usd(0)",
      deltaPercentageStr: "amt(0)%",
      strColor: undefined,
    });
  });

  it("returns positive strings and price-up color when hasProfit is true", () => {
    const result = getDeltaStr({
      delta: BigNumber.from(100),
      deltaPercentage: BigNumber.from(5),
      hasProfit: true,
    });
    expect(result).toEqual({
      deltaStr: "usd(100)",
      deltaPercentageStr: "amt(5)%",
      strColor: "price-up",
    });
  });

  it("returns negative strings and price-down color when hasProfit is false", () => {
    const result = getDeltaStr({
      delta: BigNumber.from(100),
      deltaPercentage: BigNumber.from(5),
      hasProfit: false,
    });
    expect(result).toEqual({
      deltaStr: "usd(-100)",
      deltaPercentageStr: "amt(-5)%",
      strColor: "price-down",
    });
  });

  it("handles negative delta and hasProfit true", () => {
    const result = getDeltaStr({
      delta: BigNumber.from(-100),
      deltaPercentage: BigNumber.from(-5),
      hasProfit: true,
    });
    expect(result).toEqual({
      deltaStr: "usd(-100)",
      deltaPercentageStr: "amt(-5)%",
      strColor: "price-up",
    });
  });

  it("handles negative delta and hasProfit false", () => {
    const result = getDeltaStr({
      delta: BigNumber.from(-100),
      deltaPercentage: BigNumber.from(-5),
      hasProfit: false,
    });
    expect(result).toEqual({
      deltaStr: "usd(100)",
      deltaPercentageStr: "amt(5)%",
      strColor: "price-down",
    });
  });
});

describe("getDeltaBeforeFeesStr and getDeltaAfterFeesStr", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (formatAmountUsdModule.formatAmountUsd as jest.Mock).mockImplementation((v) => `usd(${v.toString()})`);
    (formatAmountModule.formatAmount as jest.Mock).mockImplementation((v) => `amt(${v.toString()})`);
  });

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
    pendingDelta: BigNumber.from(123),
    hasLowCollateral: false,
    markPrice: BigNumber.from(2100),
    deltaPercentage: BigNumber.from(7),
    hasProfitAfterFees: false,
    pendingDeltaAfterFees: BigNumber.from(456),
    deltaPercentageAfterFees: BigNumber.from(8),
    netValue: BigNumber.from(0),
    netValueAfterFees: BigNumber.from(0),
    leverage: BigNumber.from(0),
    liqPrice: BigNumber.from(0),
  };

  it("getDeltaBeforeFeesStr returns correct values", () => {
    const result = getDeltaBeforeFeesStr(position);
    expect(result).toEqual({
      deltaBeforeFeesStr: "usd(123)",
      deltaBeforeFeesPercentageStr: "amt(7)%",
      strColorBeforeFees: "price-up",
    });
  });

  it("getDeltaAfterFeesStr returns correct values", () => {
    const result = getDeltaAfterFeesStr(position);
    expect(result).toEqual({
      deltaAfterFeesStr: "usd(-456)",
      deltaAfterFeesPercentageStr: "amt(-8)%",
      strColorAfterFees: "price-down",
    });
  });
});
