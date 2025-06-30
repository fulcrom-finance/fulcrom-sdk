import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, HashZero } from "@ethersproject/constants";

import { ManageCollateralRequest, TokenInfo } from "../../types";
import { Position } from "../../types/position";
import { getDepositCollateralPriceLimit } from "../utils/priceLimit";
import { DEFAULT_SLIPPAGE_BASIS_POINTS } from "../../config";
import { getPositionMinExecutionFee } from "../utils/minExecutionFee";
import { BIG_NUM_ZERO } from "../../config/zero";
import { parseValue } from "../../utils/numbers/parseValue";

export async function buildDepositCollateralParams(
  request: ManageCollateralRequest,
  position: Position,
  toToken: TokenInfo,
  collateralToken: TokenInfo,
): Promise<ContractIncreasePositionParams> {
 
  const priceLimit = getDepositCollateralPriceLimit(
    position.isLong,
    true,
    request.allowedSlippageAmount ?? DEFAULT_SLIPPAGE_BASIS_POINTS ,
    toToken.maxPrice
  );

  const amountIn = parseValue(request.transactionAmount,collateralToken.decimals)

  const minExecutionFee = await getPositionMinExecutionFee(request.chainId)

  const params = {
      path: [position.collateralToken],
      indexToken: position.indexToken,
      minOut: BIG_NUM_ZERO,
      sizeDelta: BIG_NUM_ZERO,
      isLong: position.isLong,
      acceptablePrice: priceLimit,
      executionFee: minExecutionFee,
      referralCode: HashZero,
      callbackTarget: AddressZero,
      priceData: [],
    };

  return {
    params: params,
    amountIn: amountIn,
    override: { value: minExecutionFee },
  };
};

// pass first parameters to contract
export type IncreasePositionParamsStruct = {
  path: string[];
  indexToken: string;
  sizeDelta: BigNumber;
  isLong: boolean;
  acceptablePrice: BigNumber;
  minOut: BigNumber;
  executionFee: BigNumber;
  referralCode: string;
  callbackTarget: string;
  priceData: string[];
};

// pass params to contract as first parameter and override as second parameter
export type ContractIncreasePositionParams = {
  params: IncreasePositionParamsStruct;
  amountIn: BigNumber;
  override?: { value: BigNumber };
};
