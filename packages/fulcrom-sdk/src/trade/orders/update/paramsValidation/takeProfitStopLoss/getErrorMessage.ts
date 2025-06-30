import { USD_DECIMALS } from "../../../../../config";
import { formatAmountUsdTokenPrice } from "../../../../../utils/numbers/formatAmountUsdTokenPrice";
import { parseValue } from "../../../../../utils/numbers/parseValue";
import { ValidRange } from "../../../../utils/validateRange";

export enum InputType {
  STOP_LOSS = "stop loss",
  TAKE_PROFIT = "take profit",
}

export const getErrorMessage = ({
  validRange,
  price,
  type,
}: {
  validRange: ValidRange;
  price: string;
  type: InputType;
}) => {
  const input = parseValue(price, USD_DECIMALS).toBigInt();

  if (validRange) {
    const [min, max] = validRange;
    if (input <= min || (max !== null && input >= max)) {
      if (max) {
        return `Please input ${type} price that greater than ${formatAmountUsdTokenPrice(
          min
        )} and lesser than ${formatAmountUsdTokenPrice(max)}`;
      } else {
        return `Please input ${type} price greater than ${formatAmountUsdTokenPrice(
          min
        )}`;
      }
    }
  }
};
