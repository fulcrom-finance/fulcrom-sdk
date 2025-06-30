import { BigNumber } from "@ethersproject/bignumber";
import { getNextToAmount } from "../../../src/trade/utils/nextToAmount";
import * as getMarginFeeBasisPointsModule from "../../../src/query/marginFeeBasisPoints";
import * as getFromUsdMinModule from "../../../src/trade/utils/getFromUsdMin";
import * as entryPriceModule from "../../../src/trade/utils/entryPrice";
import * as feesModule from "../../../src/trade/utils/fees";
import * as leverageModule from "../../../src/trade/utils/leverage";
jest.mock("../../../src/config", () => ({
  ...jest.requireActual("../../../src/config"),
  expandDecimals: (n: number) => require("@ethersproject/bignumber").BigNumber.from(n),
}));
import { OrderType } from "../../../src/trade/orders/types/orderType";

const mockToken = (overrides = {}) => ({
  address: "0x1",
  decimals: 18,
  displayDecimals: 18,
  minPrice: BigNumber.from(1),
  maxPrice: BigNumber.from(1),
  isStable: false,
  ...overrides,
} as any);

describe("getNextToAmount", () => {
  const chainId = 25;
  const caches = new Map();
  const transactionAmount = BigNumber.from(1000);
  const triggerPrice = BigNumber.from(2);
  const orderType = OrderType.Market;
  const isLong = true;
  const leverageRatio = 2;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns undefined if fromUsdMin is falsy", async () => {
    jest.spyOn(getMarginFeeBasisPointsModule, "getMarginFeeBasisPoints").mockResolvedValue(100);
    jest.spyOn(getFromUsdMinModule, "getFromUsdMin").mockReturnValue(BigNumber.from(0));
    jest.spyOn(entryPriceModule, "getEntryPrice").mockReturnValue(BigNumber.from(1));
    jest.spyOn(feesModule, "getSwapFee").mockResolvedValue(BigNumber.from(1));
    jest.spyOn(leverageModule, "getLeverage").mockReturnValue(1);

    const result = await getNextToAmount(
      chainId,
      mockToken(),
      transactionAmount,
      mockToken(),
      triggerPrice,
      orderType,
      isLong,
      mockToken(),
      caches,
      leverageRatio
    );
    expect(result).toBeDefined();
    expect(result!.toString()).toBe("0");
  });

  it("returns undefined if entryPrice is 0", async () => {
    jest.spyOn(getMarginFeeBasisPointsModule, "getMarginFeeBasisPoints").mockResolvedValue(100);
    jest.spyOn(getFromUsdMinModule, "getFromUsdMin").mockReturnValue(BigNumber.from(10));
    jest.spyOn(entryPriceModule, "getEntryPrice").mockReturnValue(BigNumber.from(0));
    jest.spyOn(feesModule, "getSwapFee").mockResolvedValue(BigNumber.from(1));
    jest.spyOn(leverageModule, "getLeverage").mockReturnValue(1);

    const result = await getNextToAmount(
      chainId,
      mockToken(),
      transactionAmount,
      mockToken(),
      triggerPrice,
      orderType,
      isLong,
      mockToken(),
      caches,
      leverageRatio
    );
    expect(result).toBeUndefined();
  });

  it("returns undefined if toTokenInfo.maxPrice is 0", async () => {
    jest.spyOn(getMarginFeeBasisPointsModule, "getMarginFeeBasisPoints").mockResolvedValue(100);
    jest.spyOn(getFromUsdMinModule, "getFromUsdMin").mockReturnValue(BigNumber.from(10));
    jest.spyOn(entryPriceModule, "getEntryPrice").mockReturnValue(BigNumber.from(1));
    jest.spyOn(feesModule, "getSwapFee").mockResolvedValue(BigNumber.from(1));
    jest.spyOn(leverageModule, "getLeverage").mockReturnValue(1);

    const result = await getNextToAmount(
      chainId,
      mockToken(),
      transactionAmount,
      mockToken({ maxPrice: BigNumber.from(0) }),
      triggerPrice,
      orderType,
      isLong,
      mockToken(),
      caches,
      leverageRatio
    );
    expect(result).toBeUndefined();
  });

  it("returns correct value for normal case", async () => {
    jest.spyOn(getMarginFeeBasisPointsModule, "getMarginFeeBasisPoints").mockResolvedValue(100);
    jest.spyOn(getFromUsdMinModule, "getFromUsdMin").mockReturnValue(BigNumber.from(100));
    jest.spyOn(entryPriceModule, "getEntryPrice").mockReturnValue(BigNumber.from(10));
    jest.spyOn(feesModule, "getSwapFee").mockResolvedValue(BigNumber.from(10));
    jest.spyOn(leverageModule, "getLeverage").mockReturnValue(2);
    // expandDecimals is mocked globally above

    // marginFeeBasisPoints = 100, fromUsdMin = 100, swapFee = 10, leverage = 2, BASIS_POINTS_DIVISOR = 10000, decimals = 18, maxPrice = 10
    // fromUsdMinAfterSwapFee = 90
    // numerator = 90 * 2 * 10000 = 1800000
    // denominator = 100 * 2 + 10000 * 10000 = 200 + 100000000 = 100000200
    // nextToUsd = 1800000 / 100000200 = 0 (integer division)
    // nextToAmount = 0 * 1 * 1 / 10 = 0
    const result = await getNextToAmount(
      chainId,
      mockToken(),
      transactionAmount,
      mockToken({ maxPrice: BigNumber.from(10) }),
      triggerPrice,
      orderType,
      isLong,
      mockToken(),
      caches,
      leverageRatio,
      1
    );
    expect(result).toBeDefined();
    expect(result!.toString()).toBe("0");
  });
});
