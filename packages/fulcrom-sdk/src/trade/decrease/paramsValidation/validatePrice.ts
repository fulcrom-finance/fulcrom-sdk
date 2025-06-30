import { BigNumber } from "@ethersproject/bignumber";
import { USD_DECIMALS } from "../../../config";
import { formatAmountUsd } from "../../../utils/numbers/formatAmountUsd";
import { parseValue } from "../../../utils/numbers/parseValue";
import { ValidRange } from "../../utils/validateRange";
import { Position } from "../../../types/position";
import { TokenInfo } from "../../../types";

export const validatePrice = (params: {
  position: Position;
  triggerExecutionPrice?: string;
  indexTokenInfo: TokenInfo;
}) => {
  const { position, triggerExecutionPrice, indexTokenInfo } = params;
  const errorMsg: string[] = [];
  if (!triggerExecutionPrice) {
    return [];
  }
  const triggerPrice = parseValue(triggerExecutionPrice, USD_DECIMALS);

  const liqPriceBigInt = position.liqPrice.toBigInt();
  if (position.isLong && triggerPrice.lte(position.liqPrice)) {
    // for long,
    // take profit can be max
    // stop loss has limitation
    const validRange: ValidRange = [liqPriceBigInt, null];

    const min = formatAmountUsd(validRange[0], {
      displayDecimals: indexTokenInfo.decimals,
    });
    errorMsg.push(`Price below Liq Price, available range: >${min}`);
  }

  if (!position.isLong && triggerPrice.gte(position.liqPrice)) {
    // for short,
    // take profit need to > 0
    // stop loss need to below liq price
    const validRange: ValidRange = [
      BigNumber.from(0).toBigInt(),
      liqPriceBigInt,
    ];
    const min = formatAmountUsd(validRange[0], {
      displayDecimals: indexTokenInfo.decimals,
    });

    errorMsg.push(
      `Price above Liq Price, available range: ${
        validRange[1]
          ? `${min}-${formatAmountUsd(validRange[1], {
              displayDecimals: indexTokenInfo.decimals,
            })} (exclusive)`
          : `>${min}`
      }`
    );
  }

  return errorMsg;
};
