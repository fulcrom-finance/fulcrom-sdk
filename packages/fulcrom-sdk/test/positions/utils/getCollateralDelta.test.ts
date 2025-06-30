import { BigNumber } from "@ethersproject/bignumber";
import { getCollateralDelta } from "../../../src/positions/utils/getCollateralDelta";
import * as getDeltaModule from "../../../src/positions/utils/getDelta";
import * as getHasProfitModule from "../../../src/positions/utils/getHasProfit";
import * as getIsClosingModule from "../../../src/positions/utils/getIsClosing";
import * as getPriceModule from "../../../src/positions/utils/getPrice";
import * as getPositionFeeModule from "../../../src/trade/utils/fees";
import { Position } from "../../../src/types/position";
import { ChainId } from "../../../src/types/chain";

jest.mock("../../../src/positions/utils/getDelta");
jest.mock("../../../src/positions/utils/getHasProfit");
jest.mock("../../../src/positions/utils/getIsClosing");
jest.mock("../../../src/positions/utils/getPrice");
jest.mock("../../../src/trade/utils/fees");

const basePosition: Position = {
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

const chainId = ChainId.CRONOS_MAINNET;
const caches = new Map();

describe("getCollateralDelta", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPriceModule.getEntryPrice as jest.Mock).mockReturnValue(BigNumber.from(2100));
    (getHasProfitModule.getHasProfit as jest.Mock).mockReturnValue(true);
    (getDeltaModule.getDelta as jest.Mock).mockReturnValue(BigNumber.from(100));
    (getPositionFeeModule.getPositionFee as jest.Mock).mockResolvedValue(BigNumber.from(20));
    (getIsClosingModule.getIsClosing as jest.Mock).mockReturnValue(false);
  });

  it("returns 0 if position size is 0", async () => {
    const pos = { ...basePosition, size: BigNumber.from(0) };
    const result = await getCollateralDelta({
      position: pos,
      isMarket: true,
      decreaseAmount: "0",
      triggerPrice: undefined,
      sizeDelta: BigNumber.from(100),
      chainId,
      isKeepLeverage: true,
      caches,
    });
    expect(result.eq(0)).toBe(true);
  });

  it("returns 0 if isClosing is true", async () => {
    (getIsClosingModule.getIsClosing as jest.Mock).mockReturnValue(true);
    const result = await getCollateralDelta({
      position: basePosition,
      isMarket: true,
      decreaseAmount: "100",
      triggerPrice: undefined,
      sizeDelta: BigNumber.from(100),
      chainId,
      isKeepLeverage: true,
      caches,
    });
    expect(result.eq(0)).toBe(true);
  });

  it("returns adjustedCollateral + (totalFees - delta) if isKeepLeverage && hasProfit && delta <= totalFees", async () => {
    (getHasProfitModule.getHasProfit as jest.Mock).mockReturnValue(true);
    (getDeltaModule.getDelta as jest.Mock).mockReturnValue(BigNumber.from(10));
    (getPositionFeeModule.getPositionFee as jest.Mock).mockResolvedValue(BigNumber.from(20));
    const pos = { ...basePosition, fundingFee: BigNumber.from(5) };
    const result = await getCollateralDelta({
      position: pos,
      isMarket: true,
      decreaseAmount: "10",
      triggerPrice: undefined,
      sizeDelta: BigNumber.from(100),
      chainId,
      isKeepLeverage: true,
      caches,
    });
    // adjustedCollateral = 500 * 100 / 1000 = 50
    // totalFees = 20 + 5 = 25
    // delta = 10
    // result = 50 + (25 - 10) = 65
    expect(result.eq(65)).toBe(true);
  });

  it("returns adjustedCollateral if isKeepLeverage && hasProfit && delta > totalFees", async () => {
    (getHasProfitModule.getHasProfit as jest.Mock).mockReturnValue(true);
    (getDeltaModule.getDelta as jest.Mock).mockReturnValue(BigNumber.from(30));
    (getPositionFeeModule.getPositionFee as jest.Mock).mockResolvedValue(BigNumber.from(5));
    const pos = { ...basePosition, fundingFee: BigNumber.from(5) };
    const result = await getCollateralDelta({
      position: pos,
      isMarket: true,
      decreaseAmount: "10",
      triggerPrice: undefined,
      sizeDelta: BigNumber.from(100),
      chainId,
      isKeepLeverage: true,
      caches,
    });
    // adjustedCollateral = 50, totalFees = 10, delta = 30
    // result = 50 (since delta > totalFees)
    expect(result.eq(50)).toBe(true);
  });

  it("returns adjustedCollateral - delta - totalFees if isKeepLeverage && !hasProfit", async () => {
    (getHasProfitModule.getHasProfit as jest.Mock).mockReturnValue(false);
    (getDeltaModule.getDelta as jest.Mock).mockReturnValue(BigNumber.from(10));
    (getPositionFeeModule.getPositionFee as jest.Mock).mockResolvedValue(BigNumber.from(5));
    const pos = { ...basePosition, fundingFee: BigNumber.from(5) };
    const result = await getCollateralDelta({
      position: pos,
      isMarket: true,
      decreaseAmount: "10",
      triggerPrice: undefined,
      sizeDelta: BigNumber.from(100),
      chainId,
      isKeepLeverage: true,
      caches,
    });
    // adjustedCollateral = 50, totalFees = 10, delta = 10
    // result = 50 - 10 - 10 = 30
    expect(result.eq(30)).toBe(true);
  });

  it("returns totalFees - delta if !isKeepLeverage && hasProfit && delta <= totalFees", async () => {
    (getHasProfitModule.getHasProfit as jest.Mock).mockReturnValue(true);
    (getDeltaModule.getDelta as jest.Mock).mockReturnValue(BigNumber.from(10));
    (getPositionFeeModule.getPositionFee as jest.Mock).mockResolvedValue(BigNumber.from(5));
    const pos = { ...basePosition, fundingFee: BigNumber.from(5) };
    const result = await getCollateralDelta({
      position: pos,
      isMarket: true,
      decreaseAmount: "10",
      triggerPrice: undefined,
      sizeDelta: BigNumber.from(100),
      chainId,
      isKeepLeverage: false,
      caches,
    });
    // totalFees = 10, delta = 10
    // result = 0 (since delta == totalFees)
    expect(result.eq(0)).toBe(true);
  });

  it("returns 0 if !isKeepLeverage && hasProfit && delta > totalFees", async () => {
    (getHasProfitModule.getHasProfit as jest.Mock).mockReturnValue(true);
    (getDeltaModule.getDelta as jest.Mock).mockReturnValue(BigNumber.from(20));
    (getPositionFeeModule.getPositionFee as jest.Mock).mockResolvedValue(BigNumber.from(5));
    const pos = { ...basePosition, fundingFee: BigNumber.from(5) };
    const result = await getCollateralDelta({
      position: pos,
      isMarket: true,
      decreaseAmount: "10",
      triggerPrice: undefined,
      sizeDelta: BigNumber.from(100),
      chainId,
      isKeepLeverage: false,
      caches,
    });
    // totalFees = 10, delta = 20
    // result = 0 (since delta > totalFees)
    expect(result.eq(0)).toBe(true);
  });

  it("returns delta if !isKeepLeverage && !hasProfit", async () => {
    (getHasProfitModule.getHasProfit as jest.Mock).mockReturnValue(false);
    (getDeltaModule.getDelta as jest.Mock).mockReturnValue(BigNumber.from(10));
    (getPositionFeeModule.getPositionFee as jest.Mock).mockResolvedValue(BigNumber.from(5));
    const pos = { ...basePosition, fundingFee: BigNumber.from(5) };
    const result = await getCollateralDelta({
      position: pos,
      isMarket: true,
      decreaseAmount: "10",
      triggerPrice: undefined,
      sizeDelta: BigNumber.from(100),
      chainId,
      isKeepLeverage: false,
      caches,
    });
    // result = delta = 10
    expect(result.eq(10)).toBe(true);
  });
});
