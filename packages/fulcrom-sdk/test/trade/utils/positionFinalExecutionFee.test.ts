import { BigNumber } from "@ethersproject/bignumber";
import { getPositionFinalExecutionFee } from "../../../src/trade/utils/positionFinalExecutionFee";

jest.mock("../../../src/trade/utils/tpslFinalExecutionFee", () => ({
  getTpSlFinalExecutionFee: jest.fn(),
}));
jest.mock("../../../src/trade/utils/minExecutionFee", () => ({
  getOrderMinExecutionFee: jest.fn(),
  getPositionMinExecutionFee: jest.fn(),
}));

import { getTpSlFinalExecutionFee } from "../../../src/trade/utils/tpslFinalExecutionFee";
import { getOrderMinExecutionFee, getPositionMinExecutionFee } from "../../../src/trade/utils/minExecutionFee";

describe("getPositionFinalExecutionFee", () => {
  const chainId = 25 as any;
  let caches: Map<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    caches = new Map();
  });

  it("returns sum of positionMinExecutionFee and tpSlFinalExecutionFee when both are defined", async () => {
    (getPositionMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(100));
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(200));
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(50));

    const result = await getPositionFinalExecutionFee(chainId, true, false, caches);
    expect(result.toString()).toBe("150");
    expect(getTpSlFinalExecutionFee).toHaveBeenCalledWith(true, false, BigNumber.from(200));
  });

  it("returns 0 if positionMinExecutionFee is falsy", async () => {
    (getPositionMinExecutionFee as jest.Mock).mockResolvedValue(undefined);
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(200));
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(50));

    const result = await getPositionFinalExecutionFee(chainId, false, true, caches);
    expect(result.toString()).toBe("0");
  });

  it("returns 0 if tpSlFinalExecutionFee is falsy", async () => {
    (getPositionMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(100));
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(200));
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(undefined);

    const result = await getPositionFinalExecutionFee(chainId, false, false, caches);
    expect(result.toString()).toBe("0");
  });

  it("returns 0 if both are falsy", async () => {
    (getPositionMinExecutionFee as jest.Mock).mockResolvedValue(undefined);
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(200));
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(undefined);

    const result = await getPositionFinalExecutionFee(chainId, false, false, caches);
    expect(result.toString()).toBe("0");
  });

  it("returns correct sum when both are zero", async () => {
    (getPositionMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(0));
    (getOrderMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(0));
    (getTpSlFinalExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(0));

    const result = await getPositionFinalExecutionFee(chainId, true, true, caches);
    expect(result.toString()).toBe("0");
  });
});
