import type { KmbFormatThreshold } from './types';
import { ThresholdLengthMap } from './types';

export interface KmbInfo {
  unit: 'K' | 'M' | 'B' | undefined;
  decimalsOffset: number;
}

export const getKmbInfo = (
  integer: string,
  threshold?: KmbFormatThreshold,
): KmbInfo => {
  if (
    threshold === undefined ||
    integer.length < ThresholdLengthMap[threshold] ||
    integer.length < ThresholdLengthMap[1e3]
  ) {
    return { unit: undefined, decimalsOffset: 0 };
  } else if (integer.length < ThresholdLengthMap[1e6]) {
    return { unit: 'K', decimalsOffset: ThresholdLengthMap[1e3] - 1 };
  } else if (integer.length < ThresholdLengthMap[1e9]) {
    return { unit: 'M', decimalsOffset: ThresholdLengthMap[1e6] - 1 };
  } else {
    return { unit: 'B', decimalsOffset: ThresholdLengthMap[1e9] - 1 };
  }
};
