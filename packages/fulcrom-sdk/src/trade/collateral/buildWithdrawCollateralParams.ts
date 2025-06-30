import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";

import { ManageCollateralRequest, TokenInfo } from "../../types";
import { Position } from "../../types/position";
import { getDepositCollateralPriceLimit } from "../utils/priceLimit";
import { DEFAULT_SLIPPAGE_BASIS_POINTS, USD_DECIMALS } from "../../config";
import { getPositionMinExecutionFee } from "../utils/minExecutionFee";
import { BIG_NUM_ZERO } from "../../config/zero";
import { parseValue } from "../../utils/numbers/parseValue";
import { ContractDecreasePositionParams } from "../orders/position/createDecreasePositionParams";

export async function buildWithdrawCollateralParams(
  request: ManageCollateralRequest,
  position: Position,
  toToken: TokenInfo,
): Promise<ContractDecreasePositionParams> {
 
  const priceLimit = getDepositCollateralPriceLimit(
    position.isLong,
    false,
    request.allowedSlippageAmount ?? DEFAULT_SLIPPAGE_BASIS_POINTS ,
    toToken.maxPrice
  );

  const withdrawAmount = parseValue(request.transactionAmount, USD_DECIMALS);

  const minExecutionFee = await getPositionMinExecutionFee(request.chainId);

  const params = {
      path: [position.collateralToken],
      indexToken: position.indexToken,
      collateralDelta: withdrawAmount.add(
        position.fundingFee || BigNumber.from(0),
      ),
      minOut: BIG_NUM_ZERO,
      sizeDelta: BIG_NUM_ZERO,
      isLong: position.isLong,
      receiver: request.account,
      acceptablePrice: priceLimit,
      executionFee: minExecutionFee,
      withdrawETH: false,
      callbackTarget: AddressZero,
      priceData: [],
    };

  return {
    params: params,
    override: { value: minExecutionFee.toString() },
  };
};