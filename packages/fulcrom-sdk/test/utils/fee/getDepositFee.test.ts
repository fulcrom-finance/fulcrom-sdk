import { BigNumber } from "@ethersproject/bignumber";
import { getDepositFee } from "../../../src/utils/fee/getDepositFee";
import { BIG_NUM_ZERO } from "../../../src/config/zero";

describe("getDepositFee", () => {
  const userPayAmount = BigNumber.from("1000000"); // 1,000,000 units

  it("returns 0.3% fee when isLong and isLeverageDecreased are true", () => {
    const fee = getDepositFee({
      userPayAmount,
      isLong: true,
      isLeverageDecreased: true,
    });
    // 0.3% of 1,000,000 = 3,000
    const expectedFee = userPayAmount.mul(3).div(1000);
    expect(fee.eq(expectedFee)).toBe(true);
  });

  it("returns zero when isLong is false and isLeverageDecreased is true", () => {
    const fee = getDepositFee({
      userPayAmount,
      isLong: false,
      isLeverageDecreased: true,
    });
    expect(fee.eq(BIG_NUM_ZERO)).toBe(true);
  });

  it("returns zero when isLong is true and isLeverageDecreased is false", () => {
    const fee = getDepositFee({
      userPayAmount,
      isLong: true,
      isLeverageDecreased: false,
    });
    expect(fee.eq(BIG_NUM_ZERO)).toBe(true);
  });

  it("returns zero when both isLong and isLeverageDecreased are false", () => {
    const fee = getDepositFee({
      userPayAmount,
      isLong: false,
      isLeverageDecreased: false,
    });
    expect(fee.eq(BIG_NUM_ZERO)).toBe(true);
  });

  it("returns zero when userPayAmount is zero", () => {
    const fee = getDepositFee({
      userPayAmount: BIG_NUM_ZERO,
      isLong: true,
      isLeverageDecreased: true,
    });
    expect(fee.eq(BIG_NUM_ZERO)).toBe(true);
  });
});
