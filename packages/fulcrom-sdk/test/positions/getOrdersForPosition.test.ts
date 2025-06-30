import { getOrdersForPosition, getDecreaseOrdersForPosition } from "../../src/positions/getOrdersForPosition";

describe("getOrdersForPosition", () => {
  const position = {
    indexToken: "0xAAA",
    isLong: true,
    collateralToken: "0xBBB",
  };

  const matchingOrder = {
    indexToken: "0xAAA",
    isLong: true,
    collateralToken: "0xBBB",
    id: 1,
  };

  const nonMatchingIndexToken = {
    indexToken: "0xCCC",
    isLong: true,
    collateralToken: "0xBBB",
    id: 2,
  };

  const nonMatchingIsLong = {
    indexToken: "0xAAA",
    isLong: false,
    collateralToken: "0xBBB",
    id: 3,
  };

  const nonMatchingCollateralToken = {
    indexToken: "0xAAA",
    isLong: true,
    collateralToken: "0xDDD",
    id: 4,
  };

  it("returns only orders that match all fields", () => {
    const orders = [
      matchingOrder,
      nonMatchingIndexToken,
      nonMatchingIsLong,
      nonMatchingCollateralToken,
    ];

    const result = getOrdersForPosition(position, orders as any);
    expect(result).toEqual([matchingOrder]);
  });

  it("returns empty array if no orders match", () => {
    const orders = [
      nonMatchingIndexToken,
      nonMatchingIsLong,
      nonMatchingCollateralToken,
    ];

    const result = getOrdersForPosition(position, orders as any);
    expect(result).toEqual([]);
  });

  it("returns empty array if orders is empty", () => {
    const result = getOrdersForPosition(position, []);
    expect(result).toEqual([]);
  });
});

describe("getDecreaseOrdersForPosition", () => {
  const position = {
    indexToken: "0xAAA",
    isLong: true,
    collateralToken: "0xBBB",
  };

  const matchingOrder = {
    indexToken: "0xAAA",
    isLong: true,
    collateralToken: "0xBBB",
    id: 1,
  };

  const nonMatchingOrder = {
    indexToken: "0xCCC",
    isLong: false,
    collateralToken: "0xDDD",
    id: 2,
  };

  it("returns only matching decrease orders", () => {
    const orders = [matchingOrder, nonMatchingOrder];
    const result = getDecreaseOrdersForPosition(position, orders as any);
    expect(result).toEqual([matchingOrder]);
  });

  it("returns empty array if no decrease orders match", () => {
    const orders = [nonMatchingOrder];
    const result = getDecreaseOrdersForPosition(position, orders as any);
    expect(result).toEqual([]);
  });
});
