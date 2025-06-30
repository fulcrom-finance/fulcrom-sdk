import { BigNumber } from "@ethersproject/bignumber";
import { getTpSlFinalExecutionFee } from "../../../src/trade/utils/tpslFinalExecutionFee";

describe("getTpSlFinalExecutionFee", () => {
  const minFee = BigNumber.from(100);

  it("returns 0 if orderBookMinExecutionFee is falsy", async () => {
    const result = await getTpSlFinalExecutionFee(true, true, undefined as any);
    expect(result.toString()).toBe("0");
  });

  it("returns minFee if only tp is enabled", async () => {
    const result = await getTpSlFinalExecutionFee(false, true, minFee);
    expect(result.toString()).toBe("100");
  });

  it("returns minFee if only sl is enabled", async () => {
    const result = await getTpSlFinalExecutionFee(true, false, minFee);
    expect(result.toString()).toBe("100");
  });

  it("returns minFee * 2 if both tp and sl are enabled", async () => {
    const result = await getTpSlFinalExecutionFee(true, true, minFee);
    expect(result.toString()).toBe("200");
  });

  it("returns 0 if both tp and sl are disabled", async () => {
    const result = await getTpSlFinalExecutionFee(false, false, minFee);
    expect(result.toString()).toBe("0");
  });
});
