import { getPosition } from "../../src/positions/getPosition";

jest.mock("../../src/positions/getPositions", () => ({
  getPositions: jest.fn(),
}));
jest.mock("../../src/positions/getPositionKey", () => ({
  getPositionKey: jest.fn(),
}));

import { getPositions } from "../../src/positions/getPositions";
import { getPositionKey } from "../../src/positions/getPositionKey";

describe("getPosition", () => {
  const account = "0xabc";
  const toToken = "0xdef";
  const chainId = 1 as any;
  const isLong = true;
  const collateralTokenAddress = "0xcol";
  const caches = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the matching position if found", async () => {
    const fakeKey = "key-123";
    (getPositionKey as jest.Mock).mockReturnValue(fakeKey);
    const positions = [
      { key: "key-111", foo: "bar" },
      { key: fakeKey, foo: "baz" },
    ];
    (getPositions as jest.Mock).mockResolvedValue(positions);

    const result = await getPosition({
      account,
      toToken,
      chainId,
      isLong,
      collateralTokenAddress,
      caches,
    });

    expect(getPositionKey).toHaveBeenCalledWith({
      account,
      toToken,
      isLong,
      collateralTokenAddress,
    });
    expect(getPositions).toHaveBeenCalledWith({ account, chainId, caches });
    expect(result).toEqual({ key: fakeKey, foo: "baz" });
  });

  it("returns undefined if no matching position is found", async () => {
    const fakeKey = "key-999";
    (getPositionKey as jest.Mock).mockReturnValue(fakeKey);
    const positions = [
      { key: "key-111", foo: "bar" },
      { key: "key-222", foo: "baz" },
    ];
    (getPositions as jest.Mock).mockResolvedValue(positions);

    const result = await getPosition({
      account,
      toToken,
      chainId,
      isLong,
      collateralTokenAddress,
      caches,
    });

    expect(result).toBeUndefined();
  });
});
