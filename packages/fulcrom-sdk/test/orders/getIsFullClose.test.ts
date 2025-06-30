import { getIsFullClose } from "../../src/orders/getIsFullClose";
import { BigNumber } from "@ethersproject/bignumber";
import { ONE_USD } from "../../src/config/constants";

describe("getIsFullClose", () => {
  it("returns true if position.size > 0 and position.size - order.sizeDelta < ONE_USD", () => {
    const position = { size: ONE_USD.mul(2) };
    const order = { sizeDelta: ONE_USD.mul(1) };
    // 2*ONE_USD - 1*ONE_USD = 1*ONE_USD < ONE_USD? false, so use 1.5*ONE_USD - 1*ONE_USD = 0.5*ONE_USD < ONE_USD
    const position2 = { size: ONE_USD.mul(3).div(2) };
    const order2 = { sizeDelta: ONE_USD };
    expect(getIsFullClose(position2, order2)).toBe(true);
  });

  it("returns false if position.size - order.sizeDelta >= ONE_USD", () => {
    const position = { size: ONE_USD.mul(2) };
    const order = { sizeDelta: ONE_USD };
    // 2*ONE_USD - 1*ONE_USD = 1*ONE_USD >= ONE_USD
    expect(getIsFullClose(position, order)).toBe(false);
  });

  it("returns false if position.size is zero", () => {
    const position = { size: BigNumber.from(0) };
    const order = { sizeDelta: BigNumber.from(0) };
    expect(getIsFullClose(position, order)).toBe(false);
  });
});
