import { ZERO_BIG_INT } from "../../config/zero";
import { ValidationParams } from "../../types";
import { getUserMaxLeverage } from "../../utils/insaneMode/getUserMaxLeverage";

export const validateLeverage = async (params: ValidationParams) => {
  if (!params.leverageRatio) {
    return [];
  }

  const errorMsg: string[] = [];
  const leverage = params.leverageRatio;

  const maxLeverage = 
    await getUserMaxLeverage({
      chainId: params.chainId,
      account: params.account,
    })
  
  if (
    leverage > maxLeverage || // leverage cant be larger than max leverage
    leverage <= ZERO_BIG_INT //FIXME: the estimate leverage function will yield negative number if sizeDelta exceed a certain amount
  ) {
    errorMsg.push(`Exceeded the max allowed leverage ${maxLeverage}x`);
  }
  return errorMsg;
};
