import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { buildWithdrawCollateralParams } from "../../../src/trade/collateral/buildWithdrawCollateralParams";
import {
  DEFAULT_SLIPPAGE_BASIS_POINTS,
  USD_DECIMALS,
} from "../../../src/config";
import { ManageCollateralRequest, TokenInfo } from "../../../src/types";
import { Position } from "../../../src/types/position";
import * as minExecutionFeeModule from "../../../src/trade/utils/minExecutionFee";
import * as priceLimitModule from "../../../src/trade/utils/priceLimit";
import { BIG_NUM_ZERO } from "../../../src/config/zero";
import { parseValue } from "../../../src/utils/numbers/parseValue";

jest.mock("../../../src/trade/utils/minExecutionFee");
jest.mock("../../../src/trade/utils/priceLimit");

describe("buildWithdrawCollateralParams", () => {
  const mockMinExecutionFee = BigNumber.from("10000000000000000");
  const mockPriceLimit = BigNumber.from("123456789");

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

  it("should build correct withdraw collateral params", async () => {
    const request: ManageCollateralRequest = {
      account: "0x1111111111111111111111111111111111111111",
      chainId: 25,
      type: "WithdrawCollateral" as any,
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
      fundingFee: BigNumber.from("1000"),
      // ...other required fields with dummy values
    } as any;

    const toToken: TokenInfo = {
      maxPrice: "50000",
      // ...other required fields with dummy values
    } as any;

    const expectedWithdrawAmount = parseValue(
      request.transactionAmount,
      USD_DECIMALS
    );

    const result = await buildWithdrawCollateralParams(
      request,
      position,
      toToken
    );

    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("override");
    expect(result.params.path).toEqual([position.collateralToken]);
    expect(result.params.indexToken).toBe(position.indexToken);
    expect(result.params.collateralDelta.toString()).toBe(
      expectedWithdrawAmount.add(position.fundingFee).toString()
    );
    expect(result.params.minOut.toString()).toBe(BIG_NUM_ZERO.toString());
    expect(result.params.sizeDelta.toString()).toBe(BIG_NUM_ZERO.toString());
    expect(result.params.isLong).toBe(position.isLong);
    expect(result.params.receiver).toBe(request.account);
    expect(result.params.acceptablePrice.toString()).toBe(
      mockPriceLimit.toString()
    );
    expect(result.params.executionFee.toString()).toBe(
      mockMinExecutionFee.toString()
    );
    expect(result.params.withdrawETH).toBe(false);
    expect(result.params.callbackTarget).toBe(AddressZero);
    expect(Array.isArray(result.params.priceData)).toBe(true);
    expect(result.override!.value).toBe(mockMinExecutionFee.toString());
  });
});
