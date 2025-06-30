import { BigNumber } from "@ethersproject/bignumber";
import * as getCollateralDeltaModule from "../../../../src/positions/utils/getCollateralDelta";
import * as getSizeDeltaModule from "../../../../src/positions/utils/getSizeDelta";
import { getNextCollateral } from "../../../../src/trade/decrease/utils/getNextCollateral";
import { ChainId } from "../../../../src/types";

describe("getNextCollateral", () => {
  const mockPosition = {
    collateral: BigNumber.from(1000),
  } as any;

  const mockDecreaseOrders = [] as any;
  const mockCaches = new Map();

  beforeEach(() => {
    jest.spyOn(getSizeDeltaModule, "getSizeDelta").mockReturnValue(BigNumber.from(100));
    jest.spyOn(getCollateralDeltaModule, "getCollateralDelta").mockResolvedValue(BigNumber.from(200));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 0 if isClosing is true", async () => {
    const result = await getNextCollateral({
      position: mockPosition,
      isClosing: true,
      isMarket: true,
      decreaseAmount: "100",
      chainId: ChainId.CRONOS_TESTNET,
      isKeepLeverage: false,
      decreaseOrders: mockDecreaseOrders,
      caches: mockCaches,
    });
    expect(result.eq(0)).toBe(true);
  });

  it("returns position.collateral - collateralDelta if isClosing is false", async () => {
    const result = await getNextCollateral({
      position: mockPosition,
      isClosing: false,
      isMarket: true,
      decreaseAmount: "100",
      chainId: ChainId.CRONOS_TESTNET,
      isKeepLeverage: false,
      decreaseOrders: mockDecreaseOrders,
      caches: mockCaches,
    });
    expect(result.eq(BigNumber.from(800))).toBe(true);
  });
});
