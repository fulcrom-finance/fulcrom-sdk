import { executeWithdrawCollateral } from "../../../src/trade/collateral/withdrawCollateral";
import {
  ManageCollateralRequest,
  ManageCollateralType,
  TokenInfo,
} from "../../../src/types";
import * as getPositionModule from "../../../src/positions/getPosition";
import * as buildWithdrawCollateralParamsModule from "../../../src/trade/collateral/buildWithdrawCollateralParams";
import * as generateCreateDecreasePositionTxDataModule from "../../../src/trade/orders/position/generateCreateDecreasePositionTxData";

describe("executeWithdrawCollateral", () => {
  const mockRequest: ManageCollateralRequest = {
    account: "0x1111111111111111111111111111111111111111",
    chainId: 25,
    type: ManageCollateralType.WithdrawCollateral,
    collateralTokenSymbol: "USDC",
    targetTokenSymbol: "BTC",
    isLongPosition: true,
    transactionAmount: "100.00",
    allowedSlippageAmount: 50,
  };

  const mockToTokenInfo: TokenInfo = {
    address: "0x2222222222222222222222222222222222222222",
    maxPrice: "50000",
  } as any;

  const mockCollateralTokenInfo: TokenInfo = {
    address: "0x3333333333333333333333333333333333333333",
    decimals: 6,
  } as any;

  const mockPosition = { id: "mockPosition" };
  const mockWithdrawParams = { params: {}, override: {} };
  const mockTxData = { data: "0xabc" };

  const caches = new Map();

  beforeEach(() => {
    jest
      .spyOn(getPositionModule, "getPosition")
      .mockResolvedValue(mockPosition as any);
    jest
      .spyOn(
        buildWithdrawCollateralParamsModule,
        "buildWithdrawCollateralParams"
      )
      .mockResolvedValue(mockWithdrawParams as any);
    jest
      .spyOn(
        generateCreateDecreasePositionTxDataModule,
        "generateCreateDecreasePositionTxData"
      )
      .mockResolvedValue(mockTxData as any);
    // jest.spyOn(configModule, "getContractAddress").mockReturnValue("0x7b0223C018A3394Ad401F976594Ba82C6cBcf4C4");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns success when position exists", async () => {
    const result = await executeWithdrawCollateral(
      mockRequest,
      mockToTokenInfo,
      mockCollateralTokenInfo,
      caches
    );
    expect(result.statusCode).toBe(200);
    expect(result.message).toEqual(["withdraw collateral success"]);
    expect(result.txData).toEqual([mockTxData]);
  });

  it("returns error if position not found", async () => {
    (getPositionModule.getPosition as jest.Mock).mockResolvedValueOnce(
      undefined
    );
    const result = await executeWithdrawCollateral(
      mockRequest,
      mockToTokenInfo,
      mockCollateralTokenInfo,
      caches
    );
    expect(result.statusCode).toBe(400);
    expect(result.message[0]).toMatch(/cannot find position info/);
  });

  it("returns error if type is not WithdrawCollateral", async () => {
    const badRequest = { ...mockRequest, type: "DepositCollateral" as any };
    const result = await executeWithdrawCollateral(
      badRequest,
      mockToTokenInfo,
      mockCollateralTokenInfo,
      caches
    );
    expect(result.statusCode).toBe(400);
    expect(result.message[0]).toMatch(/the type is not correct/);
  });
});
