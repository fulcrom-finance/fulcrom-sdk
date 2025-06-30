
import { validateManageCollateralParams } from "../../../src/trade/collateral/validateManageCollateralParams";
import { ChainId } from "../../../src/types";
import { ManageCollateralType } from "../../../src/types/sdk";

describe("validateManageCollateralParams", () => {
  const validRequest = {
    account: "0x0000000000000000000000000000000000000001",
    chainId: ChainId.CRONOS_TESTNET,
    type: ManageCollateralType.DepositCollateral,
    collateralTokenSymbol: "USDC",
    targetTokenSymbol: "BTC",
    isLongPosition: true,
    transactionAmount: "100.00",
    allowedSlippageAmount: 50,
  };

  it("returns no errors for a valid request", () => {
    const errors = validateManageCollateralParams({ ...validRequest });
    expect(errors).toEqual([]);
  });

  it("returns error for invalid chainId", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      chainId: 999999,
    });
    expect(errors[0]).toMatch(/Invalid chainId/);
  });

  it("returns error for invalid type", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      type: "InvalidType",
    } as any);
    expect(errors[0]).toMatch(/Invalid type/);
  });

  it("returns error for missing isLongPosition", () => {
    const req = { ...validRequest } as any;
    delete req.isLongPosition;
    const errors = validateManageCollateralParams(req);
    expect(errors[0]).toMatch(/Invalid isLongPosition/);
  });

  it("returns error for invalid account address", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      account: "not-an-address",
    });
    expect(errors.some(e => e.includes("Invalid account address"))).toBe(true);
  });

  it("returns error for transactionAmount not a string", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      transactionAmount: 100,
    } as any);
    expect(errors[0]).toMatch(/must be a string/);
  });

  it("returns error for transactionAmount not positive", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      transactionAmount: "-1",
    });
    expect(errors.some(e => e.includes("must be a number greater than 0"))).toBe(true);
  });

  it("returns error for transactionAmount with too many decimals", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      transactionAmount: "1.12345678901234567890",
    });
    expect(errors.some(e => e.includes("decimals must be less than"))).toBe(false);
  });

  it("returns error for allowedSlippageAmount out of range", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      allowedSlippageAmount: 100000,
    });
    expect(errors[0]).toMatch(/Invalid allowedSlippageAmount/);
  });

  it("returns error for empty targetTokenSymbol", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      targetTokenSymbol: "",
    });
    expect(errors[0]).toMatch(/Invalid targetTokenSymbol/);
  });


  it("returns error for missing collateralTokenSymbol on short", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      isLongPosition: false,
      collateralTokenSymbol: "",
    });
    expect(errors.some(e => e.includes("Invalid collateralTokenSymbol"))).toBe(true);
  });

  it("returns error for invalid collateralTokenSymbol on short", () => {
    const errors = validateManageCollateralParams({
      ...validRequest,
      isLongPosition: false,
      collateralTokenSymbol: "BTC",
    });
    expect(errors.some(e => e.includes("Invalid collateralTokenSymbol"))).toBe(true);
  });

});
