import { BigNumber } from "@ethersproject/bignumber";
import {
  getOrderMinExecutionFee,
  getPositionMinExecutionFee,
  getPositionMinExecutionFeeUsd,
} from "../../../src/trade/utils/minExecutionFee";
import * as orderBookModule from "../../../src/contracts/OrderBook";
import * as positionRouterModule from "../../../src/contracts/PositionRouter";
import * as expandDecimalsModule from "../../../src/utils/numbers/expandDecimals";

describe("minExecutionFee utils", () => {
  const chainId = 25;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getOrderMinExecutionFee returns minExecutionFee + 1", async () => {
    const minExecutionFee = BigNumber.from(1000);
    jest.spyOn(orderBookModule, "getOrderBook").mockReturnValue({
      minExecutionFee: jest.fn().mockResolvedValue(minExecutionFee),
    } as any);

    const result = await getOrderMinExecutionFee(chainId);
    expect(result.toString()).toBe("1001");
  });

  it("getPositionMinExecutionFee returns contract value", async () => {
    const minExecutionFee = BigNumber.from(555);
    jest.spyOn(positionRouterModule, "getPositionRouter").mockReturnValue({
      minExecutionFee: jest.fn().mockResolvedValue(minExecutionFee),
    } as any);

    const result = await getPositionMinExecutionFee(chainId);
    expect(result.toString()).toBe("555");
  });

  it("getPositionMinExecutionFeeUsd returns undefined if fee is falsy", async () => {
    jest.spyOn(positionRouterModule, "getPositionRouter").mockReturnValue({
      minExecutionFee: jest.fn().mockResolvedValue(undefined),
    } as any);

    const result = await getPositionMinExecutionFeeUsd(chainId);
    expect(result).toBeUndefined();
  });

  it("getPositionMinExecutionFeeUsd returns correct USD value", async () => {
    const minExecutionFee = BigNumber.from(1000);
    jest.spyOn(positionRouterModule, "getPositionRouter").mockReturnValue({
      minExecutionFee: jest.fn().mockResolvedValue(minExecutionFee),
    } as any);
    jest.spyOn(expandDecimalsModule, "expandDecimals").mockReturnValue(BigNumber.from(10));

    // nativeTokenPrice is hardcoded to 1000 in the implementation
    // result = 1000 * 1000 / 10 = 100000
    const result = await getPositionMinExecutionFeeUsd(chainId);
    expect(result?.toString()).toBe("100000");
  });
});
