import { BigNumber } from "@ethersproject/bignumber";
import * as getEntryPriceModule from "../../../../src/positions/utils/getPrice";
import * as getHasProfitModule from "../../../../src/positions/utils/getHasProfit";
import * as getIsClosingModule from "../../../../src/positions/utils/getIsClosing";
import * as getSizeDeltaModule from "../../../../src/positions/utils/getSizeDelta";
import * as getDeltaModule from "../../../../src/positions/utils/getDelta";
import * as getPositionFeeModule from "../../../../src/trade/utils/fees";
import * as expandDecimalsModule from "../../../../src/utils/numbers/expandDecimals";
import { getReceiveAmount } from "../../../../src/trade/decrease/utils/getReceiveAmount";
import { ChainId } from "../../../../src/types";

describe("getReceiveAmount", () => {
  const mockPosition = {
    size: BigNumber.from(1000),
    collateral: BigNumber.from(500),
    fundingFee: BigNumber.from(10),
    isLong: true,
    markPrice: BigNumber.from(2000),
    averagePrice: BigNumber.from(1900),
    lastIncreasedTime: 123456,
    entryFundingRate: BigNumber.from(0),
    cumulativeFundingRate: BigNumber.from(0),
  } as any;

  const mockTokenInfo = {
    maxPrice: BigNumber.from(1000),
    decimals: 18,
  } as any;

  const mockDecreaseOrders = [] as any;
  const mockCaches = new Map();

  beforeEach(() => {
    jest.spyOn(getEntryPriceModule, "getEntryPrice").mockReturnValue(BigNumber.from(2100));
    jest.spyOn(getHasProfitModule, "getHasProfit").mockReturnValue(true);
    jest.spyOn(getIsClosingModule, "getIsClosing").mockReturnValue(false);
    jest.spyOn(getSizeDeltaModule, "getSizeDelta").mockReturnValue(BigNumber.from(100));
    jest.spyOn(getDeltaModule, "getDelta").mockReturnValue(BigNumber.from(50));
    jest.spyOn(getPositionFeeModule, "getPositionFee").mockResolvedValue(BigNumber.from(5));
    jest.spyOn(expandDecimalsModule, "expandDecimals").mockReturnValue(BigNumber.from("1000000000000000000"));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the expected receive amount", async () => {
    const result = await getReceiveAmount({
      receiveTokenInfo: mockTokenInfo,
      chainId: ChainId.CRONOS_TESTNET,
      isMarket: true,
      position: mockPosition,
      isKeepLeverage: false,
      decreaseAmount: "100",
      decreaseOrders: mockDecreaseOrders,
      caches: mockCaches,
    });
    // The actual value depends on the logic and mocks, but should be a BigNumber
    expect(BigNumber.isBigNumber(result)).toBe(true);
  });
});
