import {
  getContractAddress,
} from "../../config";
import { ManageCollateralRequest, ManageCollateralType, TokenInfo } from "../../types";
import { getPosition } from "../../positions/getPosition";
import { buildWithdrawCollateralParams } from "./buildWithdrawCollateralParams";
import { generateCreateDecreasePositionTxData } from "../orders/position/generateCreateDecreasePositionTxData";

/**
 * withdraw collateral
 */
export async function executeWithdrawCollateral(
  request: ManageCollateralRequest,
  toTokenInfo: TokenInfo,
  collateralTokenInfo: TokenInfo,
  caches: Map<string, any>
) {
  // firstly to get order 
  if (request.type == ManageCollateralType.WithdrawCollateral) {
    const existingPosition = await getPosition({
      account: request.account,
      toToken: toTokenInfo.address,
      chainId: request.chainId,
      isLong:  request.isLongPosition,
      collateralTokenAddress: collateralTokenInfo.address,
      caches
    });
    if (existingPosition) {
      //  build withdrawCollateralParams
      const withdrawCollateralParams = await buildWithdrawCollateralParams(
        request,
        existingPosition,
        toTokenInfo,
      );

      const txData = await generateCreateDecreasePositionTxData({
        account: request.account,
        chainId: request.chainId,
        plugin: getContractAddress("PositionRouter", request.chainId),
        contractParams: withdrawCollateralParams,
      });

      return {
        statusCode: 200,
        message: ["withdraw collateral success"],
        txData: [txData],
      };

    } else {
      return {
        statusCode: 400,
        message: ["error: cannot find position info"],
      };
    }

  } else {
    return {
      statusCode: 400,
      message: ["error: the type is not correct"],
    };
  }
};