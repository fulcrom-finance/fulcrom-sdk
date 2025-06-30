import { Address, ChainId } from "../types";
import { validateEvmAddress } from "../trade/paramsValidation/validateAddress";

export function validateChainIdAndAccount(
  account: Address,
  chainId: ChainId
): string[] {
  const errors: string[] = [];
    // Validate chainId
    if (!Object.values(ChainId).includes(chainId)) {
      errors.push(`Invalid chainId: ${chainId}`);
    }
     // Validate account address format
  validateEvmAddress(account, errors);
  return errors;
}
