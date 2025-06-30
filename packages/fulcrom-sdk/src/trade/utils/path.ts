export const getCreateIncreasePositionPath = (
  fromAddress: string,
  toAddress: string,
  shortCollateralAddress: string,
  isShort: boolean
) : string[] => {
    let path = []; // empty instead of assuming long

    if (isShort) {
      path = [shortCollateralAddress];
      if (fromAddress !== shortCollateralAddress) {
        path = [fromAddress, shortCollateralAddress];
      }
    } else {
      path = [toAddress]; // assume long

      if (fromAddress !== toAddress) {
        path = [fromAddress, toAddress];
      }
    }

    return path;
};


// params are address, not symbol and you need get the address by symbol
export const getCreateDecreasePositionPath = (
  collateralAddress: string,
  receiveAddress: string,
) : string[] => {
    let path = []; 
    const isNeedSwap = collateralAddress !== receiveAddress;

    if (isNeedSwap) {
       path = [collateralAddress, receiveAddress];
    } else {
      path = [collateralAddress]; 
    }

    return path;
};
