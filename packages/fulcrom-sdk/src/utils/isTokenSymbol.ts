import type { TokenSymbol } from '../config';
import { tokens } from '../config';

export const isTokenSymbol = (
  tokenSymbolLike: string,
): tokenSymbolLike is TokenSymbol => {
  return tokens.includes(tokenSymbolLike as TokenSymbol);
};
