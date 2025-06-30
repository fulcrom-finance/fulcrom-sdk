import { executeDepositCollateral } from "../../../src/trade/collateral/depositCollateral";
import {
  ManageCollateralRequest,
  ManageCollateralType,
  TokenInfo,
} from "../../../src/types";
import * as getPositionModule from "../../../src/positions/getPosition";
import * as buildDepositCollateralParamsModule from "../../../src/trade/collateral/buildDepositCollateralParams";
import * as generateDepositCollateralTxDataModule from "../../../src/trade/collateral/generateDepositCollateralTxData";
import * as configModule from "../../../src/config";

describe("executeDepositCollateral", () => {
  const mockRequest: ManageCollateralRequest = {
    account: "0x1111111111111111111111111111111111111111",
    chainId: 25,
    type: ManageCollateralType.DepositCollateral,
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
  const mockDepositParams = { params: {}, override: {} };
  const mockTxData = { data: "0xabc" };

  const caches = new Map();

  beforeEach(() => {
    jest
      .spyOn(getPositionModule, "getPosition")
      .mockResolvedValue(mockPosition as any);
    jest
      .spyOn(buildDepositCollateralParamsModule, "buildDepositCollateralParams")
      .mockResolvedValue(mockDepositParams as any);
    jest
      .spyOn(
        generateDepositCollateralTxDataModule,
        "generateDepositCollateralTxData"
      )
      .mockResolvedValue(mockTxData as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns success when position exists", async () => {
    const result = await executeDepositCollateral(
      mockRequest,
      mockToTokenInfo,
      mockCollateralTokenInfo,
      caches
    );
    expect(result.statusCode).toBe(200);
    expect(result.message).toEqual(["deposit collateral success"]);
    expect(result.txData).toEqual([mockTxData]);
  });

  it("returns error if position not found", async () => {
    (getPositionModule.getPosition as jest.Mock).mockResolvedValueOnce(
      undefined
    );
    const result = await executeDepositCollateral(
      mockRequest,
      mockToTokenInfo,
      mockCollateralTokenInfo,
      caches
    );
    expect(result.statusCode).toBe(400);
    expect(result.message[0]).toMatch(/cannot find position info/);
  });

  it("returns error if type is not DepositCollateral", async () => {
    const badRequest = { ...mockRequest, type: "WithdrawCollateral" as any };
    const result = await executeDepositCollateral(
      badRequest,
      mockToTokenInfo,
      mockCollateralTokenInfo,
      caches
    );
    expect(result.statusCode).toBe(400);
    expect(result.message[0]).toMatch(/the type is not correct/);
  });
});
