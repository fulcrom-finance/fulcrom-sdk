import { CalculatedPosition, Position } from "../types/position";
import {
  getDeltaBeforeFeesStr,
  getDeltaAfterFeesStr,
} from "./utils/getDeltaStr";
import { getLiquidationAnnounceValue } from "./getLiquidationAnnounceValue";
import { getBorrowFeeRate } from "./getBorrowFeeRate";
import { formatAmountUsd } from "../utils/numbers/formatAmountUsd";
import { ChainId } from "../types";

export const getCalculatedPosition = async (
  position: Position,
  chainId: ChainId,
  caches: Map<string, any>
): Promise<CalculatedPosition> => {
  const { deltaBeforeFeesStr, deltaBeforeFeesPercentageStr } =
    getDeltaBeforeFeesStr(position);

  const { deltaAfterFeesStr, deltaAfterFeesPercentageStr } =
    getDeltaAfterFeesStr(position);

  const liquidationAnnounceValue = getLiquidationAnnounceValue(position);

  const borrowFeeRate = await getBorrowFeeRate(position, chainId, caches);

  return {
    deltaBeforeFeesStr,
    deltaBeforeFeesPercentageStr,
    deltaAfterFeesStr,
    deltaAfterFeesPercentageStr,
    liquidationAnnounceValue: formatAmountUsd(liquidationAnnounceValue),
    borrowFeeRate: formatAmountUsd(borrowFeeRate),
  };
};
