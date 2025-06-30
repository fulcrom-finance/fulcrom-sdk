export const padDecimals = (valueStr: string, decimalsLen: number): string => {
  const dotIndex = valueStr.indexOf('.');

  if (dotIndex === -1) return valueStr + '.' + '0'.repeat(decimalsLen);

  const decimalsDiff = decimalsLen - (valueStr.length - dotIndex - 1);

  if (decimalsDiff > 0) return valueStr + '0'.repeat(decimalsDiff);

  return valueStr;
};
