import appLogger from "../../common/appLogger";
import {
  getNonStableTokenBySymbol,
  getTokenBySymbol,
  TokenSymbol,
  USD_DECIMALS,
} from "../../config";
import { ChainId } from "../../types";
import {
  CheckingApprovalParams,
  CheckingType,
  CreateDecreaseRequest,
  CreateIncreaseOrderRequest,
  UpdateOrderRequest,
} from "../../types/sdk";
import { isStopOrLimitOrder, OrderType } from "../orders/types/orderType";
import { isEvmAddress, validateEvmAddress } from "./validateAddress";
import { validateAllowedSlippageAmount } from "./validateAllowedSlippage";

/**
 * Validate CreateIncreaseOrderRequest parameters
 * Returns an array of error messages for invalid fields
 */
export function validateApprovalCheckingRequest(
  request: CheckingApprovalParams
): string[] {
  const errors: string[] = [];

  const {
    checkingType,
    chainId,
    account,
    transactionAmount,
    sourceTokenSymbol,
  } = request;

  // Validate chainId
  if (!Object.values(ChainId).includes(chainId)) {
    errors.push(`Invalid chainId: ${chainId}`);
    return errors;
  }

  // Validate account address format
  if (!isEvmAddress(account)) {
    errors.push(`Invalid account address: ${account}`);
  }

  if (
    !checkingType ||
    !Object.values(CheckingType).some((v) => checkingType === v)
  ) {
    errors.push(`Invalid checkingType: ${checkingType}`);
  } else if (
    checkingType === CheckingType.TokenApproval ||
    checkingType === CheckingType.All
  ) {
    // Validate transactionAmount
    validatePositiveNumber(transactionAmount, "transactionAmount", errors);

    // Validate sourceTokenSymbol
    validateSourceTokenSymbol(
      sourceTokenSymbol,
      "sourceTokenSymbol",
      chainId,
      errors
    );
  }

  return errors;
}

/**
 * Validate CreateIncreaseOrderRequest parameters
 * Returns an array of error messages for invalid fields
 */
export function validateIncreaseOrderParams(
  request: CreateIncreaseOrderRequest
): string[] {
  const errors: string[] = [];

  const {
    chainId,
    account,
    transactionAmount,
    orderType,
    isLongPosition,
    sourceTokenSymbol,
    targetTokenSymbol,
    takeProfitTargetPrice,
    stopLossTriggerPrice,
    collateralTokenSymbol,
    leverageRatio,
    allowedSlippageAmount,
    triggerExecutionPrice,
  } = request;

  // Validate chainId
  if (!Object.values(ChainId).includes(chainId)) {
    errors.push(`Invalid chainId: ${chainId}`);
    return errors;
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

  // Validate orderType
  if (!Object.values(OrderType).includes(orderType)) {
    errors.push(`Invalid orderType: ${orderType}`);
  }

  // Validate isLongPosition
  if (isLongPosition === undefined || typeof isLongPosition !== "boolean") {
    errors.push(
      `Invalid isLongPosition: ${isLongPosition}. Expected a boolean value (true or false).`
    );
  }

  // avoid to cannot get the token info to lead the service crash by incorrect chainId
  const isValidChainId = !errors.includes(`Invalid chainId: ${chainId}`);
  if (isValidChainId) {
    // Validate sourceTokenSymbol
    validateSourceTokenSymbol(
      sourceTokenSymbol,
      "sourceTokenSymbol",
      chainId,
      errors
    );

    // Validate targetTokenSymbol
    validateTargetTokenSymbol(
      targetTokenSymbol,
      "targetTokenSymbol",
      chainId,
      errors
    );
  }

  // Validate takeProfitTargetPrice
  if (takeProfitTargetPrice) {
    validateDecimals(
      takeProfitTargetPrice,
      USD_DECIMALS,
      "takeProfitTargetPrice",
      errors
    );
    validatePositiveNumber(
      takeProfitTargetPrice,
      "takeProfitTargetPrice",
      errors
    );
  }

  // Validate stopLossTriggerPrice
  if (stopLossTriggerPrice) {
    validateDecimals(
      stopLossTriggerPrice,
      USD_DECIMALS,
      "stopLossTriggerPrice",
      errors
    );
    validatePositiveNumber(
      stopLossTriggerPrice,
      "stopLossTriggerPrice",
      errors
    );
  }

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

  // Validate leverageRatio
  if (leverageRatio) {
    validateLeverageRatio(leverageRatio, errors);
  }

  // Validate allowedSlippageAmount
  if (allowedSlippageAmount !== undefined) {
    if (typeof allowedSlippageAmount === "number") {
      validateAllowedSlippageAmount(
        allowedSlippageAmount,
        orderType === OrderType.Market,
        errors
      );
    } else {
      errors.push(
        `Invalid allowedSlippageAmount: ${allowedSlippageAmount}. Expected a number value.`
      );
    }
  }

  // Validate triggerExecutionPrice
  if (isStopOrLimitOrder(request.orderType) && triggerExecutionPrice) {
    validateDecimals(
      triggerExecutionPrice,
      USD_DECIMALS,
      "triggerExecutionPrice",
      errors
    );
    validatePositiveNumber(
      triggerExecutionPrice,
      "triggerExecutionPrice",
      errors
    );
  }

  return errors;
}

export function validateDecreaseParams(
  request: CreateDecreaseRequest
): string[] {
  const errors: string[] = [];

  const {
    account,
    chainId,
    collateralTokenSymbol,
    targetTokenSymbol,
    isLongPosition,
    decreaseAmount,
    isKeepLeverage,
    isMarket,
    allowedSlippageAmount,
    receiveTokenSymbol,
    triggerExecutionPrice,
  } = request;

  // Validate chainId
  if (!Object.values(ChainId).includes(chainId)) {
    errors.push(`Invalid chainId: ${chainId}`);
    return errors;
  }

  // Validate account address format
  validateEvmAddress(account, errors);
  // Validate decreaseAmount
  validateDecimals(decreaseAmount, USD_DECIMALS, "decreaseAmount", errors);
  validatePositiveNumber(decreaseAmount, "decreaseAmount", errors);

  // Validate isLongPosition
  if (isLongPosition === undefined || typeof isLongPosition !== "boolean") {
    errors.push(
      `Invalid isLongPosition: ${isLongPosition}. Expected a boolean value (true or false).`
    );
  }

  // Validate isMarket
  if (isMarket === undefined || typeof isMarket !== "boolean") {
    errors.push(
      `Invalid isMarket: ${isMarket}. Expected a boolean value (true or false).`
    );
  }
  // Validate isKeepLeverage
  if (isKeepLeverage === undefined || typeof isKeepLeverage !== "boolean") {
    errors.push(
      `Invalid isKeepLeverage: ${isKeepLeverage}. Expected a boolean value (true or false).`
    );
  }
  // Validate allowedSlippageAmount
  if (allowedSlippageAmount !== undefined) {
    if (typeof allowedSlippageAmount === "number") {
      validateAllowedSlippageAmount(allowedSlippageAmount, isMarket, errors);
    } else {
      errors.push(
        `Invalid allowedSlippageAmount: ${allowedSlippageAmount}. Expected a number value.`
      );
    }
  }
  if (isMarket) {
    if (!allowedSlippageAmount) {
      errors.push(
        `Invalid allowedSlippageAmount: Field is missing, undefined, or empty.`
      );
    }
  }

  // Validate collateralTokenSymbol
  validateSourceTokenSymbol(
    collateralTokenSymbol,
    "collateralTokenSymbol",
    chainId,
    errors
  );

  // Validate targetTokenSymbol
  validateTargetTokenSymbol(
    targetTokenSymbol,
    "targetTokenSymbol",
    chainId,
    errors
  );

  // Validate triggerExecutionPrice
  if (!isMarket) {
    if (!triggerExecutionPrice) {
      errors.push(
        `Invalid triggerExecutionPrice: Field is missing, undefined, or empty.`
      );
    } else {
      validateDecimals(
        triggerExecutionPrice,
        USD_DECIMALS,
        "triggerExecutionPrice",
        errors
      );
      validatePositiveNumber(
        triggerExecutionPrice,
        "triggerExecutionPrice",
        errors
      );
    }
  }

  if (isMarket) {
    if (!receiveTokenSymbol) {
      errors.push(
        `Invalid receiveTokenSymbol: Field is missing, undefined, or empty.`
      );
    }
  }
  if (receiveTokenSymbol) {
    validateTargetTokenSymbol(
      receiveTokenSymbol,
      "receiveTokenSymbol",
      chainId,
      errors
    );
  }
  return errors;
}

export function validateUpdateOrderParams(
  request: UpdateOrderRequest
): string[] {
  const errors: string[] = [];

  const {
    account,
    chainId,
    transactionAmount,
    triggerExecutionPrice,
    order,
    takeProfitTargetPrice,
    stopLossTriggerPrice,
  } = request;

  // Validate chainId
  if (!Object.values(ChainId).includes(chainId)) {
    errors.push(`Invalid chainId: ${chainId}`);
    return errors;
  }

  if (!order) {
    errors.push(`Invalid order: Field is missing, undefined, or empty.`);
  } else if (!order.id || typeof order.id !== "string") {
    errors.push(`Invalid order.id: ${order.id}. Expected a non-empty string.`);
  } else if (
    !order.type ||
    (order.type !== "IncreaseOrder" && order.type !== "DecreaseOrder")
  ) {
    errors.push(
      `Invalid order.type: ${order.type}. Expected 'DecreaseOrder' or 'IncreaseOrder'.`
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

  if (!triggerExecutionPrice) {
    errors.push(
      `Invalid triggerExecutionPrice: Field is missing, undefined, or empty.`
    );
  } else {
    validateDecimals(
      triggerExecutionPrice,
      USD_DECIMALS,
      "triggerExecutionPrice",
      errors
    );
    validatePositiveNumber(
      triggerExecutionPrice,
      "triggerExecutionPrice",
      errors
    );
  }

  // Validate takeProfitTargetPrice
  if (takeProfitTargetPrice) {
    validateDecimals(
      takeProfitTargetPrice,
      USD_DECIMALS,
      "takeProfitTargetPrice",
      errors
    );
    validatePositiveNumber(
      takeProfitTargetPrice,
      "takeProfitTargetPrice",
      errors
    );
  }

  // Validate stopLossTriggerPrice
  if (stopLossTriggerPrice) {
    validateDecimals(
      stopLossTriggerPrice,
      USD_DECIMALS,
      "stopLossTriggerPrice",
      errors
    );
    validatePositiveNumber(
      stopLossTriggerPrice,
      "stopLossTriggerPrice",
      errors
    );
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
function validateSourceTokenSymbol(
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
    getTokenBySymbol(value as TokenSymbol, chainId);
  } catch (error) {
    errors.push(
      error instanceof Error
        ? error.message
        : `Invalid symbol ${value} at chain ${chainId}`
    );
  }
}

/**
 * Validate token symbol
 */
export function validateTargetTokenSymbol(
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

/**
 * Validate leverage ratio
 */
function validateLeverageRatio(value: number, errors: string[]): void {
  if (typeof value !== "number") {
    errors.push(`Invalid leverageRatio: ${value}, must be a number`);
  } else if (value < 1.1) {
    errors.push(`Invalid leverageRatio: ${value}, must be greater than 1.1`);
  }
}
