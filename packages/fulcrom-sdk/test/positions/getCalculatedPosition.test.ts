import { getCalculatedPosition } from "../../src/positions/getCalculatedPosition";
import { BigNumber } from "ethers";
import { ChainId } from "../../src/types";

// Mock all dependencies
jest.mock("../../src/positions/utils/getDeltaStr", () => ({
  getDeltaBeforeFeesStr: jest.fn(() => ({
    deltaBeforeFeesStr: "beforeFees",
    deltaBeforeFeesPercentageStr: "10%",
  })),
  getDeltaAfterFeesStr: jest.fn(() => ({
    deltaAfterFeesStr: "afterFees",
    deltaAfterFeesPercentageStr: "8%",
  })),
}));
jest.mock("../../src/positions/getLiquidationAnnounceValue", () => ({
  getLiquidationAnnounceValue: jest.fn(() => BigNumber.from(123)),
}));
jest.mock("../../src/positions/getBorrowFeeRate", () => ({
  getBorrowFeeRate: jest.fn(() => Promise.resolve(BigNumber.from(456))),
}));
jest.mock("../../src/utils/numbers/formatAmountUsd", () => ({
  formatAmountUsd: jest.fn((val) => `usd:${val?.toString()}`),
}));

describe("getCalculatedPosition", () => {
  const position = { foo: "bar" } as any;
  const chainId: ChainId = 1 as ChainId;
  const caches = new Map();

  it("returns calculated position with all expected fields", async () => {
    const result = await getCalculatedPosition(position, chainId, caches);

    expect(result).toEqual({
      deltaBeforeFeesStr: "beforeFees",
      deltaBeforeFeesPercentageStr: "10%",
      deltaAfterFeesStr: "afterFees",
      deltaAfterFeesPercentageStr: "8%",
      liquidationAnnounceValue: "usd:123",
      borrowFeeRate: "usd:456",
    });
  });
});
