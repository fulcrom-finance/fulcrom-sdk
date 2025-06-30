import { ChainId } from "../../../types";
import { BigNumber } from "@ethersproject/bignumber";
import { Position } from "../../../types/position";
import { DecreaseOrder } from "../../../query/graphql";
import { getCollateralDelta } from "../../../positions/utils/getCollateralDelta";
import { getSizeDelta } from "../../../positions/utils/getSizeDelta";
import { parseValue } from "../../../utils/numbers/parseValue";
import { USD_DECIMALS } from "../../../config";
import { getOrderMinExecutionFee } from "../../utils/minExecutionFee";

export type ContractDecreaseOrderParamsStruct = {
  indexToken: string;
  sizeDelta: BigNumber;
  collateralToken: string;
  collateralDelta: BigNumber;
  isLong: boolean;
  triggerPrice: BigNumber;
  triggerAboveThreshold: boolean;
};

export type ContractDecreaseOrderParams = {
  params: ContractDecreaseOrderParamsStruct;
  override?: { value: string };
};

export async function buildCreateDecreaseOrderParams(
  position: Position,
  decreaseOrder: DecreaseOrder[],
  chainId: ChainId,
  isMarket: boolean,
  decreaseAmount: string,
  triggerExecutionPrice: string,
  isKeepLeverage: boolean,
  caches: Map<string, any>
): Promise<ContractDecreaseOrderParams> {
  const sizeDelta = getSizeDelta(
    position,
    decreaseOrder,
    isMarket,
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
  const minExecutionFee = await getOrderMinExecutionFee(chainId);

  const params = {
    indexToken: position.indexToken,
    sizeDelta: sizeDelta,
    collateralToken: position.collateralToken,
    collateralDelta: collateralDelta,
    isLong: position.isLong,
    triggerPrice: parseValue(triggerExecutionPrice, USD_DECIMALS),
    triggerAboveThreshold: triggerAboveThreshold,
  };

  return {
    params: params,
    override: { value: minExecutionFee.toString() },
  };
}
