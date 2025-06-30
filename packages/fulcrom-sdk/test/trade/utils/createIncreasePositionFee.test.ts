import { BigNumber } from "@ethersproject/bignumber";
import { getCreateIncreasePositionFee } from "../../../src/trade/utils/createIncreasePositionFee";

describe("getCreateIncreasePositionFee", () => {
  it("returns finalExecutionFee + pythUpdateFee when isNative is false", async () => {
    const fromAmount = BigNumber.from(100);
    const pythUpdateFee = BigNumber.from(10);
    const finalExecutionFee = BigNumber.from(20);
    const result = await getCreateIncreasePositionFee(
      fromAmount,
      pythUpdateFee,
      finalExecutionFee,
      false
    );
    expect(result.eq(30)).toBe(true);
  });

  it("returns finalExecutionFee + pythUpdateFee + fromAmount when isNative is true", async () => {
    const fromAmount = BigNumber.from(100);
    const pythUpdateFee = BigNumber.from(10);
    const finalExecutionFee = BigNumber.from(20);
    const result = await getCreateIncreasePositionFee(
      fromAmount,
      pythUpdateFee,
      finalExecutionFee,
      true
    );
    expect(result.eq(130)).toBe(true);
  });

  it("treats pythUpdateFee as zero if undefined", async () => {
    const fromAmount = BigNumber.from(100);
    const finalExecutionFee = BigNumber.from(20);
    const result = await getCreateIncreasePositionFee(
      fromAmount,
      BigNumber.from(0),
      finalExecutionFee,
      false
    );
    expect(result.eq(20)).toBe(true);
  });

  it("treats pythUpdateFee as zero if zero", async () => {
    const fromAmount = BigNumber.from(100);
    const pythUpdateFee = BigNumber.from(0);
    const finalExecutionFee = BigNumber.from(20);
    const result = await getCreateIncreasePositionFee(
      fromAmount,
      pythUpdateFee,
      finalExecutionFee,
      false
    );
    expect(result.eq(20)).toBe(true);
  });
});
