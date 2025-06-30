import { formatAmountUsd } from "../../utils/numbers/formatAmountUsd";
import { formatAmount } from "../../utils/numbers/formatAmount";
import { Position } from "../../types/position";

export const getDeltaBeforeFeesStr = (position: Position) => {
  const {
    deltaStr: deltaBeforeFeesStr,
    deltaPercentageStr: deltaBeforeFeesPercentageStr,
    strColor,
  } = getDeltaStr({
    delta: position.pendingDelta,
    deltaPercentage: position.deltaPercentage,
    hasProfit: position.hasProfit,
  });

  return {
    deltaBeforeFeesStr,
    deltaBeforeFeesPercentageStr,
    strColorBeforeFees: strColor,
  };
};

export const getDeltaAfterFeesStr = (position: Position) => {
  const {
    deltaStr: deltaAfterFeesStr,
    deltaPercentageStr: deltaAfterFeesPercentageStr,
    strColor,
  } = getDeltaStr({
    delta: position.pendingDeltaAfterFees,
    deltaPercentage: position.deltaPercentageAfterFees,
    hasProfit: position.hasProfitAfterFees,
  });

  return {
    deltaAfterFeesStr,
    deltaAfterFeesPercentageStr,
    strColorAfterFees: strColor,
  };
};

export function getDeltaStr({
  delta,
  deltaPercentage,
  hasProfit,
}: Pick<Position, "delta" | "deltaPercentage" | "hasProfit">) {
  if (delta.eq(0)) {
    return {
      deltaStr: formatAmountUsd("0", {
        currencySymbol: "$",
      }),
      deltaPercentageStr:
        formatAmount("0", {
          decimals: 2,
        }) + "%",
      strColor: undefined,
    };
  }

  return {
    deltaStr: formatAmountUsd(delta.mul(hasProfit ? 1 : -1), {
      currencySymbol: "$",
      smallValueMode: "show-less-than",
      showPositiveSign: true,
    }),
    deltaPercentageStr:
      formatAmount(deltaPercentage.mul(hasProfit ? 1 : -1), {
        decimals: 2,
        smallValueMode: "show-less-than",
        showPositiveSign: true,
      }) + "%",
    strColor: hasProfit ? "price-up" : "price-down",
  };
}
