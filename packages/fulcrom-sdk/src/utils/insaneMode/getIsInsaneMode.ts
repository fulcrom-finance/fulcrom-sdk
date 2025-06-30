import { formatEther } from "@ethersproject/units";

import { queryDepositBalances } from "../getDepositBalances";
import { Address, ChainId } from "../../types";
import { INSANE_FLP_THRESHOLD } from "../../config";

// is insane mode allowed
export const getIsInsaneModeEnabled = async ({
  chainId,
  account,
}: {
  chainId: ChainId;
  account: Address;
}) => {
  const stakedFlp = (await queryDepositBalances({ chainId, account }))
    ?.flpInStakedFlp;

  const stakedFlpFormatted = Number(formatEther(stakedFlp || 0));

  return stakedFlpFormatted >= INSANE_FLP_THRESHOLD;
};
