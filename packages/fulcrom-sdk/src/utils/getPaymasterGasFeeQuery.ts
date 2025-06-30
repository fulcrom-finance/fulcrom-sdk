import { getPayGasTokens } from "../config";
import { getPaymasterGasFee } from "./getPaymasterGasFee";

export const getPaymasterGasFeeQuery = (
  params: Parameters<typeof getPaymasterGasFee>[0]
) => {
  const gasTokens = getPayGasTokens(params.chainId);

  return getPaymasterGasFee({
    ...params,
    gasTokens: [...gasTokens],
  });
};
