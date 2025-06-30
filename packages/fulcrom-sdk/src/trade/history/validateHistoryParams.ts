import { Address, ChainId } from "../../types";
import { validateEvmAddress } from "../paramsValidation/validateAddress";
import { TradingEventAction } from "../../query/graphql/getTradingEvents";

export function validateHistoryParams({
  account,
  chainId,
  filters,
  // isExecutedEventOnly = false,
  pagination = {
    page: 1,
    limit: 20,
  },
}: {
  account: Address;
  chainId: ChainId;
  filters: TradingEventAction[];
  // isExecutedEventOnly: boolean;
  pagination?: {
    page: number;
    limit: number;
  };
}): string[] {
  const errors: string[] = [];
  // Validate chainId
  if (!Object.values(ChainId).includes(chainId)) {
    errors.push(`Invalid chainId: ${chainId}`);
    return errors;
  }

  // Validate account address format
  validateEvmAddress(account, errors);

  // Validate isExecutedEventOnly
  /* if (isExecutedEventOnly === undefined || typeof isExecutedEventOnly !== "boolean") {
    errors.push(
      `Invalid isExecutedEventOnly: ${isExecutedEventOnly}. Expected a boolean value (true or false).`
    );
  }*/

  // validate page
  validatePositiveNumber(pagination.page, "page", errors);
  // validate limit
  validatePositiveNumber(pagination.limit, "limit", errors);

  // Validate page and limit
  if (pagination.page !== undefined || pagination.limit !== undefined) {
    if (typeof pagination.page !== "number") {
      errors.push(`Invalid page: ${pagination.page}. Expected a number value.`);
    }
    if (typeof pagination.limit !== "number") {
      errors.push(
        `Invalid limit: ${pagination.limit}. Expected a number value.`
      );
    }

    if (!Number.isInteger(pagination.page)) {
      errors.push(`Invalid page: ${pagination.page}. Expected an integer`);
    }

    if (!Number.isInteger(pagination.limit)) {
      errors.push(`Invalid limit: ${pagination.limit}. Expected  an integer`);
    }
  }

  // Validate filters
  if (
    !Array.isArray(filters) ||
    !filters.every((f) => Object.values(TradingEventAction).includes(f))
  ) {
    errors.push(
      `Invalid filters: ${filters}. Expected each filter to be one of: ${Object.values(
        TradingEventAction
      ).join(", ")}.`
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
