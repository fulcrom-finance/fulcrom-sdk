import { BigNumber } from "@ethersproject/bignumber";
import * as getEntryPriceModule from "../../../../src/positions/utils/getPrice";
import * as getHasProfitModule from "../../../../src/positions/utils/getHasProfit";
import * as getSizeDeltaModule from "../../../../src/positions/utils/getSizeDelta";
import * as getDeltaModule from "../../../../src/positions/utils/getDelta";
import * as getMarginFeeBasisPointsModule from "../../../../src/query/marginFeeBasisPoints";
import * as getPositionLeverageModule from "../../../../src/utils/position";
import { getNextLeverage } from "../../../../src/trade/decrease/utils/getNextLeverage";
import { ChainId } from "../../../../src/types";

describe("getNextLeverage", () => {
  const mockPosition = {
    size: BigNumber.from(1000),
    isLong: true,
    markPrice: BigNumber.from(2000),
    averagePrice: BigNumber.from(1900),
    lastIncreasedTime: 123456,
    collateral: BigNumber.from(500),
    entryFundingRate: BigNumber.from(0),
    cumulativeFundingRate: BigNumber.from(0),
  } as any;

  const mockDecreaseOrders = [] as any;
  const mockCaches = new Map();

  beforeEach(() => {
    jest.spyOn(getEntryPriceModule, "getEntryPrice").mockReturnValue(BigNumber.from(2100));
    jest.spyOn(getHasProfitModule, "getHasProfit").mockReturnValue(true);
    jest.spyOn(getSizeDeltaModule, "getSizeDelta").mockReturnValue(BigNumber.from(100));
    jest.spyOn(getDeltaModule, "getDelta").mockReturnValue(BigNumber.from(50));
    jest.spyOn(getMarginFeeBasisPointsModule, "getMarginFeeBasisPoints").mockResolvedValue(8);
    jest.spyOn(getPositionLeverageModule, "getPositionLeverage").mockReturnValue(BigNumber.from(5));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the leverage from getPositionLeverage", async () => {
    const result = await getNextLeverage({
      chainId: ChainId.CRONOS_TESTNET,
      isMarket: true,
      decreaseAmount: "100",
      position: mockPosition,
      isKeepLeverage: false,
      decreaseOrders: mockDecreaseOrders,
      caches: mockCaches,
    });
    expect(result.eq(BigNumber.from(5))).toBe(true);
  });
});
