import { buildUpdateDecreaseOrderParams } from "../../../../src/trade/orders/order/updateDecreaseOrderParams";
import { BigNumber } from "@ethersproject/bignumber";
import { ChainId } from "../../../../src/types/index";

jest.mock("../../../../src/positions/utils/getCollateralDelta", () => ({
  getCollateralDelta: jest.fn(),
}));
jest.mock("../../../../src/positions/utils/getSizeDelta", () => ({
  getSizeDelta: jest.fn(),
}));
jest.mock("../../../../src/utils/numbers/parseValue", () => ({
  parseValue: jest.fn(),
}));

import { getCollateralDelta } from "../../../../src/positions/utils/getCollateralDelta";
import { getSizeDelta } from "../../../../src/positions/utils/getSizeDelta";
import { parseValue } from "../../../../src/utils/numbers/parseValue";

describe("buildUpdateDecreaseOrderParams", () => {
  const mockPosition = {
    isLong: false,
    averagePrice: BigNumber.from(1000),
  } as any;

  const mockDecreaseOrders = [
    { index: 42 }
  ] as any[];

  const chainId = ChainId.CRONOS_MAINNET;
  const isMarket = false;
  const decreaseAmount = "200";
  const triggerExecutionPrice = "900";
  const isKeepLeverage = true;
  const caches = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
    (getSizeDelta as jest.Mock).mockReturnValue(BigNumber.from(80));
    (getCollateralDelta as jest.Mock).mockResolvedValue(BigNumber.from(40));
    (parseValue as jest.Mock).mockImplementation((val) => BigNumber.from(val));
  });

  it("returns correct contract params structure", async () => {
    const result = await buildUpdateDecreaseOrderParams(
      mockPosition,
      mockDecreaseOrders,
      chainId,
      isMarket,
      decreaseAmount,
      triggerExecutionPrice,
      isKeepLeverage,
      caches
    );

    expect(result).toHaveProperty("params");
    expect(result.params.orderIndex).toBe("42");
    expect(result.params.sizeDelta.toString()).toBe("80");
    expect(result.params.collateralDelta.toString()).toBe("40");
    expect(result.params.triggerPrice.toString()).toBe(triggerExecutionPrice);
    expect(result.params.triggerAboveThreshold).toBe(false);
  });
});
