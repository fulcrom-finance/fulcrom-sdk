import { buildCreateDecreaseOrderParams } from "../../../../src/trade/orders/order/createDecreaseOrderParams";
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
jest.mock("../../../../src/trade/utils/minExecutionFee", () => ({
  getOrderMinExecutionFee: jest.fn(),
}));

import { getCollateralDelta } from "../../../../src/positions/utils/getCollateralDelta";
import { getSizeDelta } from "../../../../src/positions/utils/getSizeDelta";
import { parseValue } from "../../../../src/utils/numbers/parseValue";
import { getOrderMinExecutionFee } from "../../../../src/trade/utils/minExecutionFee";

describe("buildCreateDecreaseOrderParams", () => {
  const mockPosition = {
    indexToken: "0xindex",
    collateralToken: "0xcollateral",
    isLong: true,
    averagePrice: BigNumber.from(1000),
  } as any;

  const mockDecreaseOrders = [] as any[];

  const chainId = ChainId.CRONOS_MAINNET;
  const isMarket = true;
  const decreaseAmount = "100";
  const triggerExecutionPrice = "1200";
  const isKeepLeverage = false;
  const caches = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
    (getSizeDelta as jest.Mock).mockReturnValue(BigNumber.from(50));
    (getCollateralDelta as jest.Mock).mockResolvedValue(BigNumber.from(25));
    (parseValue as jest.Mock).mockImplementation((val) => BigNumber.from(val));
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(123));
  });

  it("returns correct contract params structure", async () => {
    const result = await buildCreateDecreaseOrderParams(
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
    expect(result).toHaveProperty("override");
    expect(result.params.indexToken).toBe(mockPosition.indexToken);
    expect(result.params.sizeDelta.toString()).toBe("50");
    expect(result.params.collateralToken).toBe(mockPosition.collateralToken);
    expect(result.params.collateralDelta.toString()).toBe("25");
    expect(result.params.isLong).toBe(true);
    expect(result.params.triggerPrice.toString()).toBe(triggerExecutionPrice);
    expect(result.params.triggerAboveThreshold).toBe(true);
    expect(result.override?.value).toBe("123");
  });
});
