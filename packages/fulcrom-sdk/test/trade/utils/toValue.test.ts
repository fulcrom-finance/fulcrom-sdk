import { BigNumber } from "@ethersproject/bignumber";
import { getToUsdMax } from "../../../src/trade/utils/toValue";

jest.mock("../../../src/trade/utils/nextToAmount", () => ({
  getNextToAmount: jest.fn(),
}));
jest.mock("../../../src/trade/utils/nextToAmount");
jest.mock("../../../src/trade/orders/types/orderType", () => ({
  isStopOrLimitOrder: jest.fn(),
  OrderType: { Limit: "Limit", Market: "Market" },
}));
jest.mock("../../../src/utils/numbers/expandDecimals", () => ({
  expandDecimals: jest.fn(),
}));
jest.mock("../../../src/config/zero", () => ({
  BIG_NUM_ZERO: BigNumber.from(0),
}));

import { getNextToAmount } from "../../../src/trade/utils/nextToAmount";
import { isStopOrLimitOrder, OrderType } from "../../../src/trade/orders/types/orderType";
import { expandDecimals } from "../../../src/utils/numbers/expandDecimals";

describe("getToUsdMax", () => {
  const chainId = 25 as any;
  const caches = new Map();
  const fromTokenInfo = { decimals: 18 } as any;
  const toTokenInfo = { decimals: 18, maxPrice: BigNumber.from(100) } as any;
  const shortCollateralTokenInfo = {} as any;
  const transactionAmount = BigNumber.from(10);
  const triggerPrice = BigNumber.from(50);

  beforeEach(() => {
    jest.clearAllMocks();
    (expandDecimals as jest.Mock).mockReturnValue(BigNumber.from(1000));
  });

  it("returns toAmount * triggerPrice / expandDecimals when isStopOrLimitOrder and triggerPrice.gt(0)", async () => {
    (getNextToAmount as jest.Mock).mockResolvedValue(BigNumber.from(5));
    (isStopOrLimitOrder as jest.Mock).mockReturnValue(true);

    const result = await getToUsdMax(
      chainId,
      fromTokenInfo,
      transactionAmount,
      toTokenInfo,
      triggerPrice,
      OrderType.Limit,
      true,
      shortCollateralTokenInfo,
      caches
    );
    // 5 * 50 / 1000 = 0.25
    expect(result.toString()).toBe("0");
    expect(getNextToAmount).toHaveBeenCalled();
    expect(isStopOrLimitOrder).toHaveBeenCalledWith(OrderType.Limit);
  });

  it("returns 0 if toTokenInfo.maxPrice is falsy", async () => {
    (getNextToAmount as jest.Mock).mockResolvedValue(BigNumber.from(5));
    (isStopOrLimitOrder as jest.Mock).mockReturnValue(false);

    const result = await getToUsdMax(
      chainId,
      fromTokenInfo,
      transactionAmount,
      { decimals: 18, maxPrice: undefined } as any,
      triggerPrice,
      OrderType.Market,
      true,
      shortCollateralTokenInfo,
      caches
    );
    expect(result.toString()).toBe("0");
  });

  it("returns toAmount * maxPrice / expandDecimals for normal case", async () => {
    (getNextToAmount as jest.Mock).mockResolvedValue(BigNumber.from(5));
    (isStopOrLimitOrder as jest.Mock).mockReturnValue(false);

    const result = await getToUsdMax(
      chainId,
      fromTokenInfo,
      transactionAmount,
      toTokenInfo,
      triggerPrice,
      OrderType.Market,
      true,
      shortCollateralTokenInfo,
      caches
    );
    // 5 * 100 / 1000 = 0.5
    expect(result.toString()).toBe("0");
  });

  it("returns 0 if getNextToAmount returns undefined", async () => {
    (getNextToAmount as jest.Mock).mockResolvedValue(undefined);
    (isStopOrLimitOrder as jest.Mock).mockReturnValue(false);

    const result = await getToUsdMax(
      chainId,
      fromTokenInfo,
      transactionAmount,
      toTokenInfo,
      triggerPrice,
      OrderType.Market,
      true,
      shortCollateralTokenInfo,
      caches
    );
    expect(result.toString()).toBe("0");
  });
});
