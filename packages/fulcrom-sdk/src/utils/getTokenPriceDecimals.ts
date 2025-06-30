export const getTokenPriceDecimals = (price: number): number => {
  if (price === 1 || price === 0) return 2; // for USDT / USDC, display 2 || 0 to display 2 decimals to have better displaying
  /**
   * fix case: for token like, SHIB, the current (2024 July) price is 0.00001635, if logic as price <= 0.00001, the decimals will be 6 instead of 8
   *
   * will lost the last 2 decimals and price as 0.000016
   *
   * when perform the swap / trading, will impact on the toAmount calculation and the impact power will be
   *
   * 0.00000035 / 0.000016 = 0.021875 = 2.18%, will a lot over allowedSlippage, causing the txn fail
   *
   * change logic to < 0.00009 to make it more accurate
   */
  if (price <= 0.00009) {
    // below 0.00009: 8 decimals
    return 8;
  } else if (price <= 0.01) {
    // below 0.01 cent: 6 decimals
    return 6;
  } else if (price <= 2) {
    // below 2 dollar: 5 decimals
    // Note: 1.xxxxx displays less width than 0.xxxxx
    return 5;
  } else if (price <= 10) {
    // below 10 dollar: 4 decimals
    return 4;
  } else if (price <= 100) {
    // below 100 dollars: 3 decimals
    return 3;
  } else {
    // above 100 dollars: 2 decimals
    return 2;
  }
};
