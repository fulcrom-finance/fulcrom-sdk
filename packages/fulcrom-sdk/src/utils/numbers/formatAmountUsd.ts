import type { BigNumber } from "@ethersproject/bignumber";

import { formatAmount } from "./formatAmount";
import type { FormatAmountOptions } from "./types";
import { USD_DECIMALS } from "../../config";

export const formatAmountUsd = (
  value: string | number | BigNumber | bigint | undefined,
  options?: Omit<FormatAmountOptions, "decimals">
) => {
  return formatAmount(value, {
    ...options,
    decimals: USD_DECIMALS,
  });
};
