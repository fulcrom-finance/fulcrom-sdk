import { buildUpdateIncreaseOrderParams } from "../../../../src/trade/orders/order/updateIncreaseOrderParams";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../../../src/utils/numbers/parseValue", () => ({
  parseValue: jest.fn(),
}));
import { parseValue } from "../../../../src/utils/numbers/parseValue";
import * as updateIncreaseOrderParamsModule from "../../../../src/trade/orders/order/updateIncreaseOrderParams";

describe("buildUpdateIncreaseOrderParams", () => {
  const mockRequest = {
    chainId: 25,
    account: "0xabc",
    transactionAmount: "1000",
    triggerExecutionPrice: "1200",
    takeProfitTargetPrice: "1500",
    stopLossTriggerPrice: "900",
  } as any;

  const mockIncreaseOrders = [
    { index: "7", triggerAboveThreshold: true }
  ] as any[];

  beforeEach(() => {
    jest.clearAllMocks();
    (parseValue as jest.Mock).mockImplementation((val) => BigNumber.from(val));
    jest.spyOn(updateIncreaseOrderParamsModule, "getSlTpPrice").mockImplementation((val) => BigNumber.from(val || 0));
    jest.spyOn(updateIncreaseOrderParamsModule, "getUpdateIncreaseOrderExecutionFee").mockResolvedValue(BigNumber.from(123));
  });

  it("returns correct contract params structure", async () => {
    const result = await updateIncreaseOrderParamsModule.buildUpdateIncreaseOrderParams(
      mockRequest,
      mockIncreaseOrders
    );

    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("override");
    expect(result.params.orderIndex).toBe("7");
    expect(result.params.sizeDelta.toString()).toBe("1000");
    expect(result.params.triggerPrice.toString()).toBe("1200");
    expect(result.params.triggerAboveThreshold).toBe(true);
    expect(result.params.tp.toString()).toBe("1500");
    expect(result.params.sl.toString()).toBe("900");
    expect(result.override.value).toBe("123");
  });
});
