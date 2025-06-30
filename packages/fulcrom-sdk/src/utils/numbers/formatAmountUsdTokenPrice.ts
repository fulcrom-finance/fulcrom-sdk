import type { BigNumber } from "@ethersproject/bignumber";

import { getTokenPriceDecimals } from "../getTokenPriceDecimals";
import { formatAmountUsd } from "./formatAmountUsd";
import type { FormatAmountOptions } from "./types";
import { DEFAULT_DECIMALS } from "../../config";

export const formatAmountUsdTokenPrice = (
  value: string | number | BigNumber | bigint | undefined,
  options?: Omit<FormatAmountOptions, "decimals" | "displayDecimals">
) => {
  return formatAmountUsd(value, {
    ...options,
    displayDecimals: getTokenPriceDecimals(
      Number(
        formatAmountUsd(value, {
          displayDecimals: DEFAULT_DECIMALS,
          thousandSeparator: false,
        })
      )
    ),
  });
};
