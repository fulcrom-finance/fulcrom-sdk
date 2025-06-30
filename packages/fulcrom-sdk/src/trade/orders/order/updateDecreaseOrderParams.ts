import { ChainId } from "../../../types";
import { BigNumber } from "@ethersproject/bignumber";
import { Position } from "../../../types/position";
import { DecreaseOrder } from "../../../query/graphql";
import { getCollateralDelta } from "../../../positions/utils/getCollateralDelta";
import { getSizeDelta } from "../../../positions/utils/getSizeDelta";
import { parseValue } from "../../../utils/numbers/parseValue";
import { USD_DECIMALS } from "../../../config";

export type ContractUpdateDecreaseOrderParamsStruct = {
  orderIndex: string;
  collateralDelta: BigNumber;
  sizeDelta: BigNumber;
  triggerPrice: BigNumber;
  triggerAboveThreshold: boolean;
};

export type ContractUpdateDecreaseOrderParams = {
  params: ContractUpdateDecreaseOrderParamsStruct;
};

export async function buildUpdateDecreaseOrderParams(
  position: Position,
  decreaseOrder: DecreaseOrder[],
  chainId: ChainId,
  isMarket: boolean,
  decreaseAmount: string,
  triggerExecutionPrice: string,
  isKeepLeverage: boolean,
  caches: Map<string, any>
): Promise<ContractUpdateDecreaseOrderParams> {
  const sizeDelta = getSizeDelta(
    position,
    decreaseOrder,
    false,
    decreaseAmount,
    triggerExecutionPrice
  );

  const collateralDelta = await getCollateralDelta({
    position,
    isMarket,
    decreaseAmount,
    triggerPrice: triggerExecutionPrice,
    sizeDelta,
    chainId,
    isKeepLeverage,
    caches,
  });

  const triggerPrice = parseValue(triggerExecutionPrice, USD_DECIMALS);
  const triggerAboveThreshold = triggerPrice.gt(position.averagePrice);

  const params = {
    orderIndex: decreaseOrder[0].index.toString(),
    sizeDelta: sizeDelta,
    collateralDelta: collateralDelta,
    triggerPrice: parseValue(triggerExecutionPrice, USD_DECIMALS),
    triggerAboveThreshold: triggerAboveThreshold,
  };

  return {
    params: params,
  };
}
