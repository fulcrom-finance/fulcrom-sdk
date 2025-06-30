jest.mock("../../../src/trade/paramsValidation/validateRequestParams", () => ({
  validateApprovalCheckingRequest: jest.fn(),
}));
jest.mock("../../../src/config", () => ({
  getTokenBySymbol: jest.fn(),
  getTokenBySymbolSafe: jest.fn(),
  getContractAddress: jest.fn(),
}));
jest.mock("../../../src/trade/approvalChecking/checkIsNeedTokenApproval", () => ({
  checkIsNeedTokenApproval: jest.fn(),
}));
jest.mock("../../../src/trade/approvalChecking/IsNeedPositionRouterApproval", () => ({
  checkIsNeedPositionRouterApproval: jest.fn(),
}));
jest.mock("../../../src/trade/approvalChecking/checkIsNeedOrderBookApproval", () => ({
  checkIsNeedOrderBookApproval: jest.fn(),
}));
jest.mock("../../../src/query/erc20/approveTokenTxData", () => ({
  approveTokenTxData: jest.fn(),
}));
jest.mock("../../../src/query/positions/approvePluginTxData", () => ({
  approvePluginTxData: jest.fn(),
}));


import { getContractAddress, getTokenBySymbol } from "../../../src/config";
import { approveTokenTxData } from "../../../src/query/erc20/approveTokenTxData";
import { validateApprovalCheckingRequest } from "../../../src/trade/paramsValidation/validateRequestParams";
import { checkIsNeedTokenApproval } from "../../../src/trade/approvalChecking/checkIsNeedTokenApproval";
import { approvalChecking } from "../../../src/trade/approvalChecking"

describe("approvalChecking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns approval needed for TokenApproval", async () => {
    (validateApprovalCheckingRequest as jest.Mock).mockReturnValue([]);
    (getTokenBySymbol as jest.Mock).mockReturnValue({ symbol: "USDT" });
    (checkIsNeedTokenApproval as jest.Mock).mockResolvedValue(true);
    (approveTokenTxData as jest.Mock).mockResolvedValue("txData");
    (getContractAddress as jest.Mock).mockReturnValue("0xrouter");

    const request = {
      checkingType: "TokenApproval",
      account: "0xabc",
      chainId: 25,
      transactionAmount: "1000",
      sourceTokenSymbol: "USDT",
    };

    const result = await approvalChecking(request as any);

    expect(result).toBeDefined();
    expect(result!.statusCode).toBe(400);
    expect(result!.message[0]).toContain("Token USDT needs approval");
    expect(result!.txData).toEqual(["txData"]);
  });

  it("returns no approval needed for TokenApproval", async () => {
    (validateApprovalCheckingRequest as jest.Mock).mockReturnValue([]);
    (getTokenBySymbol as jest.Mock).mockReturnValue({ symbol: "USDT" });
    (checkIsNeedTokenApproval as jest.Mock).mockResolvedValue(false);

    const request = {
      checkingType: "TokenApproval",
      account: "0xabc",
      chainId: 25,
      transactionAmount: "1000",
      sourceTokenSymbol: "USDT",
    };

    const result = await approvalChecking(request as any);

    expect(result).toBeDefined();
    expect(result!.statusCode).toBe(200);
    expect(result!.txData).toEqual([]);
  });

  it("returns validation error", async () => {
    (validateApprovalCheckingRequest as jest.Mock).mockReturnValue(["error"]);

    const request = {
      checkingType: "TokenApproval",
      account: "0xabc",
      chainId: 25,
      transactionAmount: "1000",
      sourceTokenSymbol: "USDT",
    };

    const result = await approvalChecking(request as any);

    expect(result).toBeDefined();
    expect(result!.statusCode).toBe(400);
    expect(result!.message[0]).toContain("Validation error");
  });
});
