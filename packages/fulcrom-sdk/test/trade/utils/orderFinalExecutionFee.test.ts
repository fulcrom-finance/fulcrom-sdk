import { BigNumber } from "@ethersproject/bignumber";
import { getOrderFinalExecutionFee } from "../../../src/trade/utils/orderFinalExecutionFee";

jest.mock("../../../src/trade/utils/tpslFinalExecutionFee", () => ({
  getTpSlFinalExecutionFee: jest.fn(),
}));
jest.mock("../../../src/trade/utils/minExecutionFee", () => ({
  getOrderMinExecutionFee: jest.fn(),
}));

import { getTpSlFinalExecutionFee } from "../../../src/trade/utils/tpslFinalExecutionFee";
import { getOrderMinExecutionFee } from "../../../src/trade/utils/minExecutionFee";

describe("getOrderFinalExecutionFee", () => {
  const chainId = 25 as any;
  let caches: Map<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    caches = new Map();
  });

  it("returns sum of orderMinExecutionFee and tpSlFinalExecutionFee when both are defined", async () => {
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(100));
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(50));

    const result = await getOrderFinalExecutionFee(chainId, true, false, caches);
    expect(result.toString()).toBe("150");
    expect(getTpSlFinalExecutionFee).toHaveBeenCalledWith(true, false, BigNumber.from(100));
  });

  it("returns 0 if orderMinExecutionFee is falsy", async () => {
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(undefined);
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(50));

    const result = await getOrderFinalExecutionFee(chainId, false, true, caches);
    expect(result.toString()).toBe("0");
  });

  it("returns 0 if tpSlFinalExecutionFee is falsy", async () => {
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(100));
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(undefined);

    const result = await getOrderFinalExecutionFee(chainId, false, false, caches);
    expect(result.toString()).toBe("0");
  });

  it("returns 0 if both are falsy", async () => {
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(undefined);
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(undefined);

    const result = await getOrderFinalExecutionFee(chainId, false, false, caches);
    expect(result.toString()).toBe("0");
  });

  it("returns correct sum when both are zero", async () => {
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(0));
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(0));

    const result = await getOrderFinalExecutionFee(chainId, true, true, caches);
    expect(result.toString()).toBe("0");
  });
});
