import {
  getContractAddress,
  getTokenBySymbolSafe,
  TokenSymbol,
} from "../../config";
import { getErc20 } from "../../contracts/ERC20";
import { Address, ChainId, CheckingApprovalParams } from "../../types";
import { getIsNative } from "../../utils/nativeTokens";
import { parseValue } from "../../utils/numbers/parseValue";

export const getTokenAllowance = (
  account: Address,
  tokenAddress: string,
  spender: string,
  chainId: ChainId
) => {
  const erc20 = getErc20(tokenAddress, { chainId });

  return erc20.allowance(account, spender);
};

export const checkIsNeedTokenApproval = async ({
  account,
  chainId,
  transactionAmount,
  sourceTokenSymbol,
}: Required<Omit<CheckingApprovalParams, "checkingType">>) => {
  const isNative = getIsNative(sourceTokenSymbol as TokenSymbol, chainId);

  const spender = getContractAddress("Router", chainId);
  const token = getTokenBySymbolSafe(sourceTokenSymbol as TokenSymbol, chainId);

  if (token) {
    const allowance = await getTokenAllowance(
      account,
      token?.address,
      spender,
      chainId
    );

    const isNeedFromTokenApproval =
      token?.address === getContractAddress("ES_FUL", chainId) // ES_FUL don't need to approve
        ? false
        : !allowance ||
          allowance.lt(parseValue(transactionAmount, token.decimals));

    return !isNative && isNeedFromTokenApproval;
  }
};
