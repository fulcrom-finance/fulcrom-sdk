import { BigNumber } from "@ethersproject/bignumber";
import { getSizeDelta } from "../../../src/positions/utils/getSizeDelta";
import * as getIsClosingModule from "../../../src/positions/utils/getIsClosing";
import * as parseValueModule from "../../../src/utils/numbers/parseValue";
import * as getExistingDecreaseOrdersModule from "../../../src/orders/getExistingOrders";
import { Position } from "../../../src/types/position";

jest.mock("../../../src/positions/utils/getIsClosing");
jest.mock("../../../src/utils/numbers/parseValue");
jest.mock("../../../src/orders/getExistingOrders");

describe("getSizeDelta", () => {
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
    (getIsClosingModule.getIsClosing as jest.Mock).mockReturnValue(false);
    (parseValueModule.parseValue as jest.Mock).mockReturnValue(BigNumber.from(100));
    (getExistingDecreaseOrdersModule.getExistingDecreaseOrders as jest.Mock).mockReturnValue([]);
  });

  it("returns position.size if isClosing is true", () => {
    (getIsClosingModule.getIsClosing as jest.Mock).mockReturnValue(true);
    const result = getSizeDelta(position, [], true, "100");
    expect(result.eq(position.size)).toBe(true);
  });

  it("returns fromUsd if not closing and no existing orders", () => {
    const result = getSizeDelta(position, [], true, "100");
    expect(result.eq(100)).toBe(true);
  });

  it("returns residualSize if not market, fromUsd > 0, existing orders, and difference < dust", () => {
    (getExistingDecreaseOrdersModule.getExistingDecreaseOrders as jest.Mock).mockReturnValue([
      { sizeDelta: BigNumber.from(300) },
      { sizeDelta: BigNumber.from(600) },
    ]);
    // position.size = 1000, sum = 900, residual = 100
    // fromUsd = 99.99, difference = 0.01 < dust (ORDER_SIZE_DUST_USD = 100000000000000000000000000000, i.e., 0.1 USD at 30 decimals)
    (parseValueModule.parseValue as jest.Mock).mockReturnValue(BigNumber.from(99));
    // Simulate difference < dust
    const result = getSizeDelta(position, [], false, "99");
    expect(result.eq(100)).toBe(true);
  });

  it("returns fromUsd if not market, fromUsd > 0, existing orders, and difference >= dust", () => {
    (getExistingDecreaseOrdersModule.getExistingDecreaseOrders as jest.Mock).mockReturnValue([
      { sizeDelta: BigNumber.from(300) },
      { sizeDelta: BigNumber.from(600) },
    ]);
    // Set up so that difference >= dust
    const dust = BigNumber.from("100000000000000000000000000000"); // 1e29
    const residual = BigNumber.from(1000);
    const fromUsd = residual.sub(dust).sub(1); // difference = dust + 1
    (parseValueModule.parseValue as jest.Mock).mockReturnValue(fromUsd);
    (getExistingDecreaseOrdersModule.getExistingDecreaseOrders as jest.Mock).mockReturnValue([
      { sizeDelta: BigNumber.from(0) },
    ]);
    const pos = { ...position, size: residual };
    const result = getSizeDelta(pos, [], false, fromUsd.toString());
    expect(result.eq(fromUsd)).toBe(true);
  });
});
