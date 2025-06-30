import { validateCancelOrderParams } from "../../../../src/trade/orders/cancel/validateCancelOrderParams";
import * as validateChainIdAndAccountModule from "../../../../src/positions/validateChainIdAndAccount";
import type { CancelOrdersRequest } from "../../../../src/types/sdk";
import { ChainId } from "../../../../src/types/chain";

describe("validateCancelOrderParams", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns no errors for valid input", () => {
    jest.spyOn(validateChainIdAndAccountModule, "validateChainIdAndAccount").mockReturnValue([]);
    const params: CancelOrdersRequest = {
      chainId: ChainId.CRONOS_MAINNET,
      account: "0xabc",
      orders: [
        { type: "IncreaseOrder", id: "order1" },
        { type: "DecreaseOrder", id: "order2" }
      ]
    };
    expect(validateCancelOrderParams(params)).toEqual([]);
  });

  it("returns error if orders is missing or empty", () => {
    jest.spyOn(validateChainIdAndAccountModule, "validateChainIdAndAccount").mockReturnValue([]);
    const params1: CancelOrdersRequest = {
      chainId: ChainId.CRONOS_MAINNET,
      account: "0xabc",
      orders: []
    };
    expect(validateCancelOrderParams(params1)).toContain("Orders must be a non-empty array.");
  });

  it("returns error for invalid order type", () => {
    jest.spyOn(validateChainIdAndAccountModule, "validateChainIdAndAccount").mockReturnValue([]);
    const params: CancelOrdersRequest = {
      chainId: ChainId.CRONOS_MAINNET,
      account: "0xabc",
      orders: [
        { type: "InvalidType" as any, id: "order1" }
      ]
    };
    expect(validateCancelOrderParams(params)).toContain(
      "Order at index 0 is missing a valid type (DecreaseOrder or IncreaseOrder)."
    );
  });

  it("returns error for missing or invalid order id", () => {
    jest.spyOn(validateChainIdAndAccountModule, "validateChainIdAndAccount").mockReturnValue([]);
    const params: CancelOrdersRequest = {
      chainId: ChainId.CRONOS_MAINNET,
      account: "0xabc",
      orders: [
        { type: "IncreaseOrder", id: "" },
        { type: "DecreaseOrder", id: undefined as any }
      ]
    };
    const errors = validateCancelOrderParams(params);
    expect(errors).toContain("Order at index 0 is missing a valid id.");
    expect(errors).toContain("Order at index 1 is missing a valid id.");
  });

  it("includes errors from validateChainIdAndAccount", () => {
    jest.spyOn(validateChainIdAndAccountModule, "validateChainIdAndAccount").mockReturnValue(["invalid account", "invalid chainId"]);
    const params: CancelOrdersRequest = {
      chainId: ChainId.CRONOS_MAINNET,
      account: "bad",
      orders: [
        { type: "IncreaseOrder", id: "order1" }
      ]
    };
    const errors = validateCancelOrderParams(params);
    expect(errors).toContain("invalid account");
    expect(errors).toContain("invalid chainId");
  });
});
