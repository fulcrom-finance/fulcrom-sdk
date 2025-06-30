import { ValidationParams } from "../../types";
import { validateTakeProfitStopLossPrice } from "./takeProfitStopLoss/validateTakeProfitStopLossPrice";
import { validateAmount } from "./validateAmount";
import { validateBalance } from "./validateBalance";
import { validateCircuitBreakerLimited } from "./validateCircuitBreakerLimited";
import { validateLeverage } from "./validateLeverage";
import { validateLiquidity } from "./validateLiquidity";
import { validateMinOrder } from "./validateMinOrder";
import { validateReducePositionLeverageAndFundingFee } from "./validateReducePositionLeverageAndFundingFee";
import { validateTriggerExecutionPrice } from "./validateTriggerExecutionPrice";

export const checkIsEligibleToCreateOrder = async (
  params: ValidationParams
) => {
  const { transactionAmount, toToken, fromToken } = params;
  const amountValidation = validateAmount(transactionAmount, toToken);
  const triggerExecutionPriceValidation = validateTriggerExecutionPrice(params);
  const balanceValidation = validateBalance(fromToken, transactionAmount);
  const minOrderValidation = validateMinOrder(fromToken, transactionAmount);
  const reducePositionLeverageAndFundingFeeValidation =
    validateReducePositionLeverageAndFundingFee(params);
  const leverageValidation = validateLeverage(params);
  const liquidityValidation = validateLiquidity(params);
  const circuitBreakerLimitedValidation = validateCircuitBreakerLimited(params);
  const TPSLPriceValidation = validateTakeProfitStopLossPrice(params);

  const validators = [
    amountValidation,
    triggerExecutionPriceValidation,
    // insufficient balance validation
    balanceValidation,
    // min order validation
    minOrderValidation,
    reducePositionLeverageAndFundingFeeValidation,
    // liquidity validation for swap - long
    // liquidity validation for swap - short
    // liquidity validation for leverage - long
    // liquidity validation for leverage - short
    liquidityValidation,
    // OI + positionSize check with oiRatioCheckThreshold
    circuitBreakerLimitedValidation,
    TPSLPriceValidation,
    leverageValidation,
  ];

  const messages = await Promise.allSettled(validators);
  const errorMessages = messages
    .filter((message) => {
      return message.status === "fulfilled";
    })
    .flatMap((message) => message.value);

  return errorMessages;
};
