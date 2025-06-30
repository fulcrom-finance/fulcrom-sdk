import { BigNumber } from "ethers";
import {
  BASIS_POINTS_DIVISOR,
  getContractAddress,
  getNonStableTokenBySymbol,
  MAX_SLIPPAGE_BASIS_POINTS,
  MIN_LEVERAGE,
  MIN_POSITION_USD,
  MIN_SLIPPAGE_BASIS_POINTS,
  TokenSymbol,
  USD_DECIMALS,
} from "../../config";
import { ChainId, TokenInfo } from "../../types";
import { Position } from "../../types/position";
import { ManageCollateralRequest, ManageCollateralType } from "../../types/sdk";
import { formatAmountUsd } from "../../utils/numbers/formatAmountUsd";
import { parseValue } from "../../utils/numbers/parseValue";
import { validateEvmAddress } from "../paramsValidation/validateAddress";
import { expandDecimals } from "../../utils/numbers/expandDecimals";
import { getMarginFeeBasisPoints } from "../../query/marginFeeBasisPoints";
import { getPositionLeverage } from "../../utils/position";
import { getUserMaxLeverage } from "../../utils/insaneMode/getUserMaxLeverage";
import {
  getCanCollateralAffordFundingFee,
  getCollateralThreshold,
} from "../../utils/fee/getCanCollateralAffordFundingFee";
import { BIG_NUM_ZERO } from "../../config/zero";
import { getMaxSwapFeeBps } from "../utils/maxSwapFeeBps";
import { getDepositFee } from "../../utils/fee/getDepositFee";
import { getTotalWeight } from "../../query/totalWeight";
import { getTotalSupply } from "../../query/erc20/totalSupply";
import { TokenManager } from "../../utils/tokenManager";
import { formatAmount } from "../../utils/numbers/formatAmount";
import { getNonZeroDecimalsPlaces } from "../../utils/getNonZeroDecimalsPlaces";
import { cacheKeys, getDataWithCache } from "../../cache";

export function validateManageCollateralParams(
  request: ManageCollateralRequest
): string[] {
  const errors: string[] = [];

  const {
    account,
    chainId,
    type,
    collateralTokenSymbol,
    targetTokenSymbol,
    isLongPosition,
    transactionAmount,
    allowedSlippageAmount,
  } = request;
  // Validate chainId
  if (!Object.values(ChainId).includes(chainId)) {
    errors.push(`Invalid chainId: ${chainId}`);
    return errors;
  }

  if (type !== "Deposit" && type !== "Withdraw") {
    errors.push(`Invalid type: ${type}. Expected 'Deposit' or 'Withdraw'.`);
  }

  // Validate isLongPosition
  if (isLongPosition === undefined || typeof isLongPosition !== "boolean") {
    errors.push(
      `Invalid isLongPosition: ${isLongPosition}. Expected a boolean value (true or false).`
    );
  }

  // Validate account address format
  validateEvmAddress(account, errors);
  // Validate transactionAmount
  validateDecimals(
    transactionAmount,
    USD_DECIMALS,
    "transactionAmount",
    errors
  );
  validatePositiveNumber(transactionAmount, "transactionAmount", errors);

  // Validate allowedSlippageAmount
  if (allowedSlippageAmount !== undefined) {
    if (typeof allowedSlippageAmount === "number") {
      if (
        allowedSlippageAmount < MIN_SLIPPAGE_BASIS_POINTS ||
        allowedSlippageAmount > MAX_SLIPPAGE_BASIS_POINTS
      ) {
        errors.push(
          `Invalid allowedSlippageAmount: ${allowedSlippageAmount}, must be between ${MIN_SLIPPAGE_BASIS_POINTS} and ${MAX_SLIPPAGE_BASIS_POINTS}`
        );
      }
    } else {
      errors.push(
        `Invalid allowedSlippageAmount: ${allowedSlippageAmount}. Expected a number value.`
      );
    }
  } else {
    errors.push(
      `Invalid allowedSlippageAmount: : Field is missing, undefined, or empty.`
    );
  }
  // Validate targetTokenSymbol
  validateTargetTokenSymbol(
    targetTokenSymbol,
    "targetTokenSymbol",
    chainId,
    errors
  );

  // Validate collateralTokenSymbol
  if (!isLongPosition) {
    const validSymbols = ["USDT", "USDC"];
    if (!collateralTokenSymbol) {
      errors.push(
        `Invalid collateralTokenSymbol: Field is missing, undefined, or empty.`
      );
    } else if (!validSymbols.includes(collateralTokenSymbol)) {
      errors.push(
        `Invalid collateralTokenSymbol: ${collateralTokenSymbol}. Expected one of: ${validSymbols.join(
          ", "
        )}.`
      );
    }
  }

  return errors;
}

/**
 * Validate if a value is a positive number
 */
function validatePositiveNumber(
  value: any,
  fieldName: string,
  errors: string[]
): void {
  const numberValue = parseFloat(value);
  if (isNaN(numberValue) || numberValue <= 0) {
    errors.push(
      `Invalid ${fieldName}: ${value}, must be a number greater than 0`
    );
  }
}

function validateDecimals(
  value: string,
  max: number,
  fieldName: string,
  errors: string[]
) {
  if (typeof value !== "string") {
    errors.push(`Invalid ${fieldName}: ${value}, must be a string`);
    return;
  }
  if (value.split(".").length > 2) {
    errors.push(
      `Invalid ${fieldName}: ${value}, must be a number with at most one decimal point`
    );
    return;
  }
  const dotIdx = value.indexOf(".");

  const decimal = dotIdx === -1 ? 0 : value.length - dotIdx - 1;

  if (decimal > max) {
    errors.push(
      `Invalid ${fieldName}: ${value}, decimals must be less than ${max}`
    );
  }
}

/**
 * Validate token symbol
 */
function validateTargetTokenSymbol(
  value: any,
  fieldName: string,
  chainId: ChainId,
  errors: string[]
): void {
  if (!value || typeof value !== "string") {
    errors.push(`Invalid ${fieldName}: ${value}. Expected a non-empty string.`);
    return;
  }
  try {
    getNonStableTokenBySymbol(value as TokenSymbol, chainId);
  } catch (error) {
    errors.push(
      error instanceof Error
        ? error.message
        : `Invalid symbol ${value} at chain ${chainId}`
    );
  }
}

export const checkIsEligibleToManageCollateral = async (
  request: ManageCollateralRequest,
  position: Position,
  tokenManager: TokenManager,
  caches: Map<string, any>
) => {
  const errors: string[] = [];
  const { type, transactionAmount, chainId, account, collateralTokenSymbol } =
    request;
  // get the collateral token info by tokenManage
  const collateralTokenInfo = tokenManager.getTokenBySymbol(
    collateralTokenSymbol as TokenSymbol,
    chainId
  );
  if (!collateralTokenInfo) {
    errors.push(
      `Invalid collateral symbol: cannot find the ${collateralTokenSymbol} info`
    );
    return errors;
  }

  const isDeposit = getIsDeposit(type);
  const collateralAmount = getCollateralAmount(
    type,
    transactionAmount,
    collateralTokenInfo
  );
  const collateralUsd = getCollateralUsd(
    type,
    transactionAmount,
    collateralTokenInfo
  );
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );
  const nextLeverage =
    getPositionLeverage(
      {
        size: position.size,
        collateralDelta: collateralUsd,
        isIncreaseCollateral: isDeposit,
        collateral: position.collateral,
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        hasProfit: position.hasProfit,
        isIncludeDelta: false,
        marginFeeBasisPoints,
      },
      chainId
    ) ?? BigNumber.from(0);

  const maxLeverage = await getUserMaxLeverage({ chainId, account });

  if (type === ManageCollateralType.WithdrawCollateral) {
    //check the next leverage
    if (nextLeverage.gt(BigNumber.from(maxLeverage * BASIS_POINTS_DIVISOR))) {
      errors.push(
        `max-${maxLeverage}x-with-lower-withdraw-amount-decrease-position`
      );
    }

    // check the remaining collateral size
    if (
      !collateralAmount.eq(0) &&
      position.collateral.sub(collateralAmount).lt(MIN_POSITION_USD)
    ) {
      const amountUsd = formatAmountUsd(MIN_POSITION_USD, {
        displayDecimals: 0,
      });
      errors.push(
        `Invalid amount: ${transactionAmount}. Leftover collateral below ${amountUsd} USD.`
      );
    }
  }

  if (type === ManageCollateralType.DepositCollateral) {
    // check the balance
    if (
      !collateralAmount.eq(0) &&
      collateralTokenInfo.balance.lt(collateralAmount)
    ) {
      const symbol = collateralTokenInfo.displaySymbol;
      errors.push(`${symbol} balance insufficient`);
    }

    // check the next leverage
    if (nextLeverage?.lt(BigNumber.from(MIN_LEVERAGE * BASIS_POINTS_DIVISOR))) {
      errors.push(
        `min-${MIN_LEVERAGE}x-with-lower-amount-increase-position-with-higher-leverage`
      );
    }

    // check if can afford fund fee
    const indexToken = tokenManager.getTokenByAddress(position.indexToken);
    if (indexToken) {
      const { tokenThreshold, valid: canDepositAffordFundingFee } =
        await getCanDepositAffordFundingFee(
          position,
          type,
          transactionAmount,
          collateralTokenInfo,
          indexToken,
          chainId,
          nextLeverage,
          caches
        );

      if (!canDepositAffordFundingFee && tokenThreshold) {
        errors.push(
          `Please input collateral more than ${formatAmount(tokenThreshold, {
            decimals: collateralTokenInfo.decimals,
            displayDecimals: getNonZeroDecimalsPlaces(
              tokenThreshold,
              collateralTokenInfo.decimals
            ),
            round: true,
          })} ${collateralTokenInfo.displaySymbol} to cover funding fee`
        );
      }
    }
  }
  return errors;
};

export const getIsDeposit = (type: string) => {
  return type === ManageCollateralType.DepositCollateral;
};

export const getCollateralAmount = (
  type: string,
  amountValue: string,
  collateralTokenInfo: TokenInfo
) => {
  const isDeposit = getIsDeposit(type);
  const decimals = isDeposit ? collateralTokenInfo.decimals : USD_DECIMALS;
  const collateralAmount = parseValue(amountValue, decimals);
  return collateralAmount;
};

export const getCollateralUsd = (
  type: string,
  amountValue: string,
  collateralTokenInfo: TokenInfo
) => {
  const isDeposit = getIsDeposit(type);
  const collateralAmount = getCollateralAmount(
    type,
    amountValue,
    collateralTokenInfo
  );

  let collateralUsd: BigNumber;
  if (!isDeposit) {
    collateralUsd = collateralAmount;
  } else if (!collateralTokenInfo?.minPrice) {
    collateralUsd = BigNumber.from(0);
  } else {
    collateralUsd = collateralAmount
      .mul(collateralTokenInfo.minPrice)
      .div(expandDecimals(collateralTokenInfo.decimals));
  }
  return collateralUsd;
};

export const getCanDepositAffordFundingFee = async (
  position: Position,
  type: string,
  amountValue: string,
  collateralTokenInfo: TokenInfo,
  indexToken: TokenInfo,
  chainId: ChainId,
  nextLeverage: BigNumber,
  caches: Map<string, any>
) => {
  const collateralAmount = getCollateralAmount(
    type,
    amountValue,
    collateralTokenInfo
  );
  const collateralUsd = getCollateralUsd(
    type,
    amountValue,
    collateralTokenInfo
  );
  const currentLeverage = position.leverage.toBigInt();
  const isLong = position.isLong;

  const usdgSupply =
    (await getDataWithCache<BigNumber, [ChainId, string]>(
      caches,
      cacheKeys.UsdgSypply,
      getTotalSupply,
      chainId,
      getContractAddress("USDG", chainId)
    )) ?? BIG_NUM_ZERO;

  const totalWeight =
    (await getDataWithCache(
      caches,
      cacheKeys.TotalWeight,
      getTotalWeight,
      chainId
    )) ?? BIG_NUM_ZERO;

  if (!indexToken)
    return {
      valid: true,
    };
  if (collateralAmount.lte(BIG_NUM_ZERO)) {
    return {
      valid: true,
    };
  }

  const depositFee = getDepositFee({
    isLeverageDecreased: nextLeverage.toBigInt() < currentLeverage,
    isLong,
    userPayAmount: collateralUsd,
  });

  const swapFeeBps = getMaxSwapFeeBps({
    fromAmount: collateralAmount,
    fromTokenInfo: collateralTokenInfo,
    toTokenInfo: indexToken,
    totalWeight,
    usdgSupply,
  });

  const swapFee = collateralUsd.mul(swapFeeBps).div(BASIS_POINTS_DIVISOR);
  const poolAmountUsd = indexToken.poolAmount
    .mul(indexToken.minPrice)
    .div(expandDecimals(indexToken.decimals));
  const reservedAmountUsd = indexToken.reservedAmount
    .mul(indexToken.minPrice)
    .div(expandDecimals(indexToken.decimals));

  const fundingFee = position.fundingFee;

  const collateralThreshold = getCollateralThreshold({
    depositFee,
    swapFee,
    fundingFee,
    marginFee: BIG_NUM_ZERO,
    poolAmount: poolAmountUsd,
    reservedAmount: reservedAmountUsd,
  });

  const canAfford = getCanCollateralAffordFundingFee({
    collateral: collateralUsd,
    fundingFee,
    /**
     * deposit, no size change, no marginFee
     */
    marginFee: BIG_NUM_ZERO,
    poolAmount: poolAmountUsd,
    reservedAmount: reservedAmountUsd,
    swapFee,
    depositFee: depositFee,
  });
  const collateralTokenThreshold = collateralThreshold
    .mul(expandDecimals(collateralTokenInfo.decimals))
    .div(collateralTokenInfo.minPrice);

  return {
    valid: canAfford,
    tokenThreshold: collateralTokenThreshold,
  };
};
