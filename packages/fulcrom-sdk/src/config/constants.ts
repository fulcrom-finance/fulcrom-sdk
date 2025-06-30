import { BigNumber } from "@ethersproject/bignumber";
import { ChainId, ChainName } from "../types";

export function expandDecimals(decimals: number): BigNumber;
export function expandDecimals(n: number, decimals: number): BigNumber;
export function expandDecimals(n: number, decimals?: number): BigNumber {
  if (decimals === undefined) {
    decimals = Number(n);
    n = 1;
  }

  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals));
}

export const USD_DECIMALS = 30;
export const ONE_USD = expandDecimals(1, USD_DECIMALS);
export const PRECISION_DECIMALS = 30;
export const PRECISION = expandDecimals(1, PRECISION_DECIMALS);
export const CRO_DECIMALS = 18;
export const USDG_DECIMALS = 18;
export const FUL_DECIMALS = 18;
export const FLP_DECIMALS = 18;
export const MIN_ORDER_USD = ONE_USD.mul(10);
export const MIN_POSITION_USD = ONE_USD.mul(10);
export const MIN_COLLATERAL = ONE_USD.mul(5);
// Collateral Left Token display decimals
export const COLLATERAL_LEFT_AMOUNT_DISPLAY_DECIMALS_MAX = 8;
export const COLLATERAL_LEFT_AMOUNT_DISPLAY_DECIMALS_MIN = 2;

// cronosOraclePrice decimals
export const CRONOS_ORACLE_PRICE_DECIMALS = 8;

// default leverage
export const DEFAULT_LEVERAGE = 2;

// Circulating Percentage
export const MAX_PRICE_DEVIATION_BASIS_POINTS = 750;
export const BASIS_POINTS_DIVISOR_DECIMALS = 4;
export const BASIS_POINTS_DIVISOR = 10000;
export const DEFAULT_MAX_USDG_AMOUNT = expandDecimals(200 * 1000 * 1000, 18);
export const FUNDING_RATE_PRECISION = 1000000;
export const TAX_BASIS_POINTS = 50;
export const STABLE_TAX_BASIS_POINTS = 5;
export const MINT_BURN_FEE_BASIS_POINTS = 25;
export const SWAP_FEE_BASIS_POINTS = 30;
export const STABLE_SWAP_FEE_BASIS_POINTS = 1;
export const MARGIN_FEE_BASIS_POINTS_FALLBACK: Record<ChainName, number> = {
  [ChainName.CRONOS]: 10, // 10 / 1000, 0.01%
};
export const FLP_COOLDOWN_DURATION = 15 * 60;

export const HIGH_SPREAD_THRESHOLD = expandDecimals(1, USD_DECIMALS).div(100); // 1%;

// Time
export const SECONDS_PER_DAY = 60 * 60 * 24;
export const SECONDS_PER_WEEK = SECONDS_PER_DAY * 7;
export const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365;
export const ONE_THOUSAND_MILLISECOND = 1000;

// Refetch Interval
export const REFETCH_INTERVAL_FAST = 4000;
export const REFETCH_INTERVAL_BASIC = 12000;
export const REFETCH_INTERVAL_SLOW = 60000;

// Wallet displaying characters
export const MAX_WALLET_CHARACTERS_MOBILE = 13; // include .cro
export const MAX_WALLET_CHARACTERS_DESKTOP = 16; // include .cro

// Amount Max Width
export const MAX_AMOUNT_WIDTH = 120; // 120px
export const ORDER_SIZE_DUST_USD = expandDecimals(1, USD_DECIMALS - 1); // $0.10

// MIN_PROFIT_BIPS and MIN_PROFIT_BIPS is set to zero(disabled)
export const MIN_PROFIT_TIME = 0;
export const MIN_PROFIT_BIPS = 0;

// IGO start Constant
export const IGO_DISPLAY_SWITCH_DAYS = 3;

// USD Value Decimals
export const USD_VALUE_CONSTRAIN_DECIMALS = expandDecimals(1, USD_DECIMALS).div(
  100
); // 0.01;

// FUL APR limitation
export const FUL_APR_LIMITATION = 50000;

// float amount safe parsing
export const FLOAT_AMOUNT_SAFE_PARSING_DIVIDER_DECIMALS = 6;

export const FLP_STAKING_AMOUNT_TO_ACTIVE_REFERRAL_TIERS = 300;

export const STANDARD_DEFAULT_STRING = "-";
export const MIN_DISPLAY_USD_VALUE = BigNumber.from("1" + "0".repeat(28)); // 0.01
// Make Flp price default as Price 1
export const DEFAULT_FLP_PRICE = expandDecimals(1, USD_DECIMALS);
export const DEFAULT_FULCROM_SDK_RPC_URL = {
  [ChainId.CRONOS_MAINNET]:
    "https://evm.cronos.org/",
  [ChainId.CRONOS_TESTNET]:
    "https://evm-t3.cronos.org",
};

export const getDefaultFulcromRpcUrl = (chainId: ChainId) => {
  return DEFAULT_FULCROM_SDK_RPC_URL[chainId];
};

export const MIN_KMB_THRESHOLD = 1e3;
export const DEFAULT_DISPLAY_DECIMALS = 2;
export const DEFAULT_DECIMALS = 18;
export const LT_PREFIX = "<";
export const AROUND_PREFIX = "~";

// allow slippage
export const DEFAULT_SLIPPAGE_BASIS_POINTS = 50;
export const MIN_SLIPPAGE_BASIS_POINTS = 10;
export const MAX_SLIPPAGE_BASIS_POINTS = 100;

export const MAX_LEVERAGE_INSANE: Record<ChainName, number> = {
  [ChainName.CRONOS]: 200,
};

export const LEVERAGE_STEP = 0.1;
export const MIN_LEVERAGE = 1 + LEVERAGE_STEP;

export const INSANE_MODE_START_LEVERAGE = 30;
export const MAX_LEVERAGE = INSANE_MODE_START_LEVERAGE - LEVERAGE_STEP;
