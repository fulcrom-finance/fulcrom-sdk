import { ValidRange } from "../../../../utils/validateRange";

export const getValidRange = ({
  entryPrice,
  isLong,
  liquidationPrice,
  isTakeProfit,
}: {
  entryPrice: bigint;
  isLong: boolean;
  liquidationPrice: bigint;
  isTakeProfit: boolean;
}): ValidRange => {
  const [min, max]: NonNullable<ValidRange> = isLong
    ? isTakeProfit
      ? [entryPrice, null]
      : [liquidationPrice, entryPrice]
    : isTakeProfit
    ? [BigInt(1), entryPrice]
    : [entryPrice, liquidationPrice];

  if (max !== null && min > max) {
    return null;
  }

  return [min < BigInt(1) ? BigInt(1) : min, max];
};
