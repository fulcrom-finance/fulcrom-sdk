import {
  getCreateIncreasePositionPath,
  getCreateDecreasePositionPath,
} from "../../../src/trade/utils/path";

describe("getCreateIncreasePositionPath", () => {
  const from = "0xfrom";
  const to = "0xto";
  const shortCollateral = "0xshort";

  it("returns [shortCollateral] when isShort and fromAddress === shortCollateralAddress", () => {
    expect(getCreateIncreasePositionPath(shortCollateral, to, shortCollateral, true)).toEqual([shortCollateral]);
  });

  it("returns [fromAddress, shortCollateralAddress] when isShort and fromAddress !== shortCollateralAddress", () => {
    expect(getCreateIncreasePositionPath(from, to, shortCollateral, true)).toEqual([from, shortCollateral]);
  });

  it("returns [toAddress] when !isShort and fromAddress === toAddress", () => {
    expect(getCreateIncreasePositionPath(to, to, shortCollateral, false)).toEqual([to]);
  });

  it("returns [fromAddress, toAddress] when !isShort and fromAddress !== toAddress", () => {
    expect(getCreateIncreasePositionPath(from, to, shortCollateral, false)).toEqual([from, to]);
  });
});

describe("getCreateDecreasePositionPath", () => {
  const collateral = "0xc";
  const receive = "0xr";

  it("returns [collateralAddress] when collateralAddress === receiveAddress", () => {
    expect(getCreateDecreasePositionPath(collateral, collateral)).toEqual([collateral]);
  });

  it("returns [collateralAddress, receiveAddress] when collateralAddress !== receiveAddress", () => {
    expect(getCreateDecreasePositionPath(collateral, receive)).toEqual([collateral, receive]);
  });
});
