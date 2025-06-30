import { BigNumber } from "@ethersproject/bignumber";

export const getCreateIncreasePositionFee = async (
  fromAmount: BigNumber, 
  pythUpdateFee: BigNumber,
  finalExecutionFee: BigNumber, 
  isNative: boolean,
) : Promise<BigNumber> => {
    let ethValue = finalExecutionFee?.add(pythUpdateFee || 0);

    if (isNative && ethValue) {
      ethValue = ethValue.add(fromAmount);
    }
    return ethValue;
};
