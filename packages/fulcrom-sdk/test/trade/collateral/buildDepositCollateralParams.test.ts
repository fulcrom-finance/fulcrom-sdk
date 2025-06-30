import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, HashZero } from "@ethersproject/constants";
import { buildDepositCollateralParams } from "../../../src/trade/collateral/buildDepositCollateralParams";
import { DEFAULT_SLIPPAGE_BASIS_POINTS } from "../../../src/config";
import { ManageCollateralRequest, TokenInfo } from "../../../src/types";
import { Position } from "../../../src/types/position";
import * as minExecutionFeeModule from "../../../src/trade/utils/minExecutionFee";
import * as priceLimitModule from "../../../src/trade/utils/priceLimit";
import { BIG_NUM_ZERO } from "../../../src/config/zero";
import { parseValue } from "../../../src/utils/numbers/parseValue";

jest.mock("../../../src/trade/utils/minExecutionFee");
jest.mock("../../../src/trade/utils/priceLimit");

describe("buildDepositCollateralParams", () => {
  const mockMinExecutionFee = BigNumber.from("10000000000000000");
  const mockPriceLimit = BigNumber.from("987654321");

  beforeAll(() => {
    (
      minExecutionFeeModule.getPositionMinExecutionFee as jest.Mock
    ).mockResolvedValue(mockMinExecutionFee);
    (
      priceLimitModule.getDepositCollateralPriceLimit as jest.Mock
    ).mockReturnValue(mockPriceLimit);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should build correct deposit collateral params", async () => {
    const request: ManageCollateralRequest = {
      account: "0x1111111111111111111111111111111111111111",
      chainId: 25,
      type: "DepositCollateral" as any,
      collateralTokenSymbol: "USDC",
      targetTokenSymbol: "BTC",
      isLongPosition: true,
      transactionAmount: "100.00",
      allowedSlippageAmount: 50,
    };

    const position: Position = {
      collateralToken: "0x2222222222222222222222222222222222222222",
      indexToken: "0x3333333333333333333333333333333333333333",
      isLong: true,
      // ...other required fields with dummy values
    } as any;

    const toToken: TokenInfo = {
      maxPrice: "50000",
      // ...other required fields with dummy values
    } as any;

    const collateralToken: TokenInfo = {
      decimals: 6,
      // ...other required fields with dummy values
    } as any;

    const expectedAmountIn = parseValue(
      request.transactionAmount,
      collateralToken.decimals
    );

    const result = await buildDepositCollateralParams(
      request,
      position,
      toToken,
      collateralToken
    );

    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("amountIn");
    expect(result).toHaveProperty("override");
    expect(result.params.path).toEqual([position.collateralToken]);
    expect(result.params.indexToken).toBe(position.indexToken);
    expect(result.params.sizeDelta.toString()).toBe(BIG_NUM_ZERO.toString());
    expect(result.params.isLong).toBe(position.isLong);
    expect(result.params.acceptablePrice.toString()).toBe(
      mockPriceLimit.toString()
    );
    expect(result.params.minOut.toString()).toBe(BIG_NUM_ZERO.toString());
    expect(result.params.executionFee.toString()).toBe(
      mockMinExecutionFee.toString()
    );
    expect(result.params.referralCode).toBe(HashZero);
    expect(result.params.callbackTarget).toBe(AddressZero);
    expect(Array.isArray(result.params.priceData)).toBe(true);
    expect(result.amountIn.toString()).toBe(expectedAmountIn.toString());
    expect(result.override!.value.toString()).toBe(
      mockMinExecutionFee.toString()
    );
  });
});
