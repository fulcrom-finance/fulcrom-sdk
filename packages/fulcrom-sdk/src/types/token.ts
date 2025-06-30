import type {
  Erc20TokenSymbol,
  IndexTokenSymbol,
  NativeTokenSymbol,
  TokenSymbol,
} from "../config";

export type Token = {
  name: string;
  image: string; //public asset path
  /* unique symbol, not necessarily the same as ERC20.symbol() */
  symbol: TokenSymbol;
  decimals: number;
  displayDecimals: number;
  isStable: boolean;
  isNative?: boolean;
  address: string;
  /** what user sees */
  displaySymbol: string;
  /** trade pair token displaying */
  baseTokenSymbol: string;
  baseTokenImage: string;
};

export type IndexToken = Omit<Token, "symbol"> & {
  symbol: IndexTokenSymbol;
  listedAt: number; //unix timestamp
  pythTokenId: string;
  candlePriceSymbol?: `${string}_usd`;
  color: string;
};

export type Erc20Token = Omit<
  Token,
  "baseTokenSymbol" | "baseTokenImage" | "symbol"
> & {
  symbol: Erc20TokenSymbol;
};

export type NativeToken = Omit<Erc20Token, "symbol" | "address"> & {
  readonly address: "0x0";
  readonly symbol: NativeTokenSymbol;
  readonly isNative: true;
};

export type PayGasToken = Erc20Token | NativeToken;
