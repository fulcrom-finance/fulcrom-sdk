import {
  MAX_SLIPPAGE_BASIS_POINTS,
  MIN_SLIPPAGE_BASIS_POINTS,
} from "../../config";

export function validateAllowedSlippageAmount(
  value: number,
  isMarket: boolean,
  errors: string[]
) {
  if (isMarket) {
    if (!(value != null)) {
      errors.push(
        `Invalid allowedSlippageAmount: ${value}, cannot be null for market order`
      );
    }
    if (
      value < MIN_SLIPPAGE_BASIS_POINTS ||
      value > MAX_SLIPPAGE_BASIS_POINTS
    ) {
      errors.push(
        `Invalid allowedSlippageAmount: ${value}, must be between ${MIN_SLIPPAGE_BASIS_POINTS} and ${MAX_SLIPPAGE_BASIS_POINTS}`
      );
    }
  }
}
