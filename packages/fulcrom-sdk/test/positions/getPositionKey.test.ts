import { getPositionKey } from "../../src/positions/getPositionKey";
import { keccak256 } from "@ethersproject/solidity";

jest.mock("@ethersproject/solidity", () => ({
  keccak256: jest.fn(),
}));

describe("getPositionKey", () => {
  const account = "0xabc0000000000000000000000000000000000000";
  const toToken = "0xdef0000000000000000000000000000000000000";
  const collateralTokenAddress = "0xcol000000000000000000000000000000000000";
  const isLong = true;

  beforeEach(() => {
    (keccak256 as jest.Mock).mockClear();
  });

  it("calls keccak256 with correct types and values", () => {
    (keccak256 as jest.Mock).mockReturnValue("0xhash1");
    const key = getPositionKey({
      account,
      toToken,
      isLong,
      collateralTokenAddress,
    });
    expect(keccak256).toHaveBeenCalledWith(
      ["address", "address", "address", "bool"],
      [account, collateralTokenAddress, toToken, isLong]
    );
    expect(key).toBe("0xhash1");
  });

  it("produces different keys for different isLong", () => {
    (keccak256 as jest.Mock)
      .mockReturnValueOnce("0xhashLong")
      .mockReturnValueOnce("0xhashShort");
    const keyLong = getPositionKey({
      account,
      toToken,
      isLong: true,
      collateralTokenAddress,
    });
    const keyShort = getPositionKey({
      account,
      toToken,
      isLong: false,
      collateralTokenAddress,
    });
    expect(keyLong).not.toBe(keyShort);
  });

  it("produces different keys for different collateralTokenAddress", () => {
    (keccak256 as jest.Mock)
      .mockReturnValueOnce("0xhashCol1")
      .mockReturnValueOnce("0xhashCol2");
    const key1 = getPositionKey({
      account,
      toToken,
      isLong,
      collateralTokenAddress: "0xcol1",
    });
    const key2 = getPositionKey({
      account,
      toToken,
      isLong,
      collateralTokenAddress: "0xcol2",
    });
    expect(key1).not.toBe(key2);
  });

  it("handles undefined collateralTokenAddress", () => {
    (keccak256 as jest.Mock).mockReturnValue("0xhashUndef");
    const key = getPositionKey({
      account,
      toToken,
      isLong,
      collateralTokenAddress: undefined,
    });
    expect(keccak256).toHaveBeenCalledWith(
      ["address", "address", "address", "bool"],
      [account, undefined, toToken, isLong]
    );
    expect(key).toBe("0xhashUndef");
  });
});
