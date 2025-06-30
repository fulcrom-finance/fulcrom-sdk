import { BigNumber } from "@ethersproject/bignumber";
import {
  getIncreasePositionPriceLimit,
  getDecreasePositionPriceLimit,
  getDepositCollateralPriceLimit,
} from "../../../src/trade/utils/priceLimit";

jest.mock("../../../src/positions/utils/getPrice", () => ({
  getEntryPrice: jest.fn(),
  getProfitPrice: jest.fn(),
}));
jest.mock("../../../src/positions/utils/getHasProfit", () => ({
  getHasProfit: jest.fn(),
}));
jest.mock("../../../src/positions/utils/getIsMinProfitTimeExpired", () => ({
  getIsMinProfitTimeExpired: jest.fn(),
}));

import { getEntryPrice, getProfitPrice } from "../../../src/positions/utils/getPrice";
import { getHasProfit } from "../../../src/positions/utils/getHasProfit";
import { getIsMinProfitTimeExpired } from "../../../src/positions/utils/getIsMinProfitTimeExpired";

const BASIS_POINTS_DIVISOR = 10000;

describe("getIncreasePositionPriceLimit", () => {
  const toToken = {
    maxPrice: BigNumber.from(1000),
    minPrice: BigNumber.from(900),
  } as any;

  it("calculates price limit for long", () => {
    const result = getIncreasePositionPriceLimit(toToken, 100, true);
    // (1000 * (10000 + 100)) / 10000 = 1010
    expect(result.toString()).toBe("1010");
  });

  it("calculates price limit for short", () => {
    const result = getIncreasePositionPriceLimit(toToken, 200, false);
    // (900 * (10000 - 200)) / 10000 = 882
    expect(result.toString()).toBe("882");
  });
});

describe("getDepositCollateralPriceLimit", () => {
  const maxPrice = BigNumber.from(1000);

  it("deposit long", () => {
    const result = getDepositCollateralPriceLimit(true, true, 100, maxPrice);
    // (1000 * (10000 + 100)) / 10000 = 1010
    expect(result.toString()).toBe("1010");
  });

  it("deposit short", () => {
    const result = getDepositCollateralPriceLimit(false, true, 200, maxPrice);
    // (1000 * (10000 - 200)) / 10000 = 980
    expect(result.toString()).toBe("980");
  });

  it("withdraw long", () => {
    const result = getDepositCollateralPriceLimit(true, false, 100, maxPrice);
    // (1000 * (10000 - 100)) / 10000 = 990
    expect(result.toString()).toBe("990");
  });

  it("withdraw short", () => {
    const result = getDepositCollateralPriceLimit(false, false, 200, maxPrice);
    // (1000 * (10000 + 200)) / 10000 = 1020
    expect(result.toString()).toBe("1020");
  });
});

describe("getDecreasePositionPriceLimit", () => {
  const basePosition = {
    isLong: true,
    markPrice: BigNumber.from(1000),
    averagePrice: BigNumber.from(900),
    lastIncreasedTime: 0,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns priceLimit when no profit", () => {
    (getEntryPrice as jest.Mock).mockReturnValue(BigNumber.from(1000));
    (getHasProfit as jest.Mock).mockReturnValue(false);
    (getIsMinProfitTimeExpired as jest.Mock).mockReturnValue(false);

    const result = getDecreasePositionPriceLimit(basePosition, true, 100);
    // (1000 * (10000 - 100)) / 10000 = 990
    expect(result.toString()).toBe("990");
  });

  it("returns profitPrice when has profit and not minProfitTimeExpired and priceLimit < profitPrice (long)", () => {
    (getEntryPrice as jest.Mock).mockReturnValue(BigNumber.from(1000));
    (getHasProfit as jest.Mock).mockReturnValue(true);
    (getIsMinProfitTimeExpired as jest.Mock).mockReturnValue(false);
    (getProfitPrice as jest.Mock).mockReturnValue(BigNumber.from(1200));

    const result = getDecreasePositionPriceLimit(basePosition, true, 100);
    // priceLimit = 990, profitPrice = 1200, so should return 1200
    expect(result.toString()).toBe("1200");
  });

  it("returns priceLimit when has profit and not minProfitTimeExpired and priceLimit >= profitPrice (long)", () => {
    (getEntryPrice as jest.Mock).mockReturnValue(BigNumber.from(1000));
    (getHasProfit as jest.Mock).mockReturnValue(true);
    (getIsMinProfitTimeExpired as jest.Mock).mockReturnValue(false);
    (getProfitPrice as jest.Mock).mockReturnValue(BigNumber.from(800));

    const result = getDecreasePositionPriceLimit(basePosition, true, 100);
    // priceLimit = 990, profitPrice = 800, so should return 990
    expect(result.toString()).toBe("990");
  });

  it("returns priceLimit when has profit but minProfitTimeExpired (long)", () => {
    (getEntryPrice as jest.Mock).mockReturnValue(BigNumber.from(1000));
    (getHasProfit as jest.Mock).mockReturnValue(true);
    (getIsMinProfitTimeExpired as jest.Mock).mockReturnValue(true);
    (getProfitPrice as jest.Mock).mockReturnValue(BigNumber.from(1200));

    const result = getDecreasePositionPriceLimit(basePosition, true, 100);
    // minProfitTimeExpired, so should return priceLimit
    expect(result.toString()).toBe("990");
  });

  it("returns profitPrice when has profit and not minProfitTimeExpired and priceLimit > profitPrice (short)", () => {
    const shortPosition = { ...basePosition, isLong: false, markPrice: BigNumber.from(1000), averagePrice: BigNumber.from(1100) };
    (getEntryPrice as jest.Mock).mockReturnValue(BigNumber.from(1000));
    (getHasProfit as jest.Mock).mockReturnValue(true);
    (getIsMinProfitTimeExpired as jest.Mock).mockReturnValue(false);
    (getProfitPrice as jest.Mock).mockReturnValue(BigNumber.from(800));

    const result = getDecreasePositionPriceLimit(shortPosition, true, 100);
    // priceLimit = (1000 * (10000 + 100)) / 10000 = 1010, profitPrice = 800, so should return 800
    expect(result.toString()).toBe("800");
  });

  it("returns priceLimit when has profit and not minProfitTimeExpired and priceLimit <= profitPrice (short)", () => {
    const shortPosition = { ...basePosition, isLong: false, markPrice: BigNumber.from(1000), averagePrice: BigNumber.from(1100) };
    (getEntryPrice as jest.Mock).mockReturnValue(BigNumber.from(1000));
    (getHasProfit as jest.Mock).mockReturnValue(true);
    (getIsMinProfitTimeExpired as jest.Mock).mockReturnValue(false);
    (getProfitPrice as jest.Mock).mockReturnValue(BigNumber.from(1200));

    const result = getDecreasePositionPriceLimit(shortPosition, true, 100);
    // priceLimit = 1010, profitPrice = 1200, so should return 1010
    expect(result.toString()).toBe("1010");
  });
});
