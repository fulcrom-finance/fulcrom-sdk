import { BigNumber } from "@ethersproject/bignumber";
import { getFromUsdMin } from "../../../src/trade/utils/getFromUsdMin";
describe("getFromUsdMin", () => {
  it("returns correct value for valid minPrice and decimals", () => {
    // expandDecimals(2) = 10^2 = 100
    const token = { minPrice: BigNumber.from(200), decimals: 2 } as any;
    const amount = BigNumber.from(5);
    // (5 * 200) / 100 = 10
    expect(getFromUsdMin(token, amount).toString()).toBe("10");
  });

  it("returns 0 if minPrice is undefined", () => {
    const token = { decimals: 2 } as any;
    const amount = BigNumber.from(5);
    expect(getFromUsdMin(token, amount).toString()).toBe("0");
  });

  it("returns 0 if minPrice is 0", () => {
    const token = { minPrice: BigNumber.from(0), decimals: 2 } as any;
    const amount = BigNumber.from(5);
    expect(getFromUsdMin(token, amount).toString()).toBe("0");
  });

  it("returns 0 if amount is 0", () => {
    const token = { minPrice: BigNumber.from(200), decimals: 2 } as any;
    const amount = BigNumber.from(0);
    expect(getFromUsdMin(token, amount).toString()).toBe("0");
  });

  it("handles large decimals", () => {
    // expandDecimals(18) = 10^18
    const token = { minPrice: BigNumber.from("3000000000000000000"), decimals: 18 } as any;
    const amount = BigNumber.from("2000000000000000000");
    // (2e18 * 3e18) / 1e18 = 6e18
    expect(getFromUsdMin(token, amount).toString()).toBe("6000000000000000000");
  });
});
