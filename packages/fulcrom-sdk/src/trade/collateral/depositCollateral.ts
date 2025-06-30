import { getContractAddress } from "../../config";
import {
  ManageCollateralRequest,
  ManageCollateralType,
  TokenInfo,
} from "../../types";
import { getPosition } from "../../positions/getPosition";
import { buildDepositCollateralParams } from "./buildDepositCollateralParams";
import { generateDepositCollateralTxData } from "./generateDepositCollateralTxData";

/**
 * deposit collateral
 */
export async function executeDepositCollateral(
  request: ManageCollateralRequest,
  toTokenInfo: TokenInfo,
  collateralTokenInfo: TokenInfo,
  caches: Map<string, any>
) {
  // firstly to get order
  if (request.type == ManageCollateralType.DepositCollateral) {

    const existingPosition = await getPosition({
      account: request.account,
      toToken: toTokenInfo.address,
      chainId: request.chainId,
      isLong: request.isLongPosition,
      collateralTokenAddress: collateralTokenInfo.address,
      caches,
    });
    
    if (existingPosition) {
      //  build depositCollateralParams
      const depositCollateralParams = await buildDepositCollateralParams(
        request,
        existingPosition,
        toTokenInfo,
        collateralTokenInfo
      );

      const txData = await generateDepositCollateralTxData({
        account: request.account,
        chainId: request.chainId,
        plugin: getContractAddress("PositionRouter", request.chainId),
        contractParams: depositCollateralParams,
      });

      return {
        statusCode: 200,
        message: ["deposit collateral success"],
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
}
