import { DecreaseOrder } from "../../../query/graphql";
import { CreateDecreaseRequest, TokenInfo } from "../../../types";
import { Position } from "../../../types/position";
import { validateDecreaseAmount } from "./validateDecreaseAmount";
import { validateLiqStatus } from "./validateLiqStatus";
import { validatePrice } from "./validatePrice";

export type ValidationDecreaseOrderParams = CreateDecreaseRequest & {
  position: Position;
  indexTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;
  receiveTokenInfo: TokenInfo;
  decreaseOrders: DecreaseOrder[];
  caches: Map<string, any>;
};
export const checkIsEligibleToCreateDecreaseOrder = async (
  params: ValidationDecreaseOrderParams
) => {
  const validators = [
    validateLiqStatus(params),
    validateDecreaseAmount(params),
    validatePrice(params),
  ];
  const messages = await Promise.allSettled(validators);
  const errorMessages = messages
    .filter((message) => {
      return message.status === "fulfilled";
    })
    .flatMap((message) => message.value);

  return errorMessages;
};
