export const doTrimTrailingZeros = (str: string) => {
  // /0+$/ is replaced by /0{0,30}$/ to avoid catastrophic backtracking, USD uses 30 decimals, so 30 should be enough in this app
  return str.indexOf('.') >= 0
    ? str.replace(/0{0,30}$/, '').replace(/\.$/, '')
    : str;
};
