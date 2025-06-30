import { getContractAddress } from "../../config";
import { getRouter } from "../../contracts/Router";
import { Address, ChainId } from "../../types";

export const checkIsNeedPositionRouterApproval = async ({
  account,
  chainId,
}: {
  account: Address;
  chainId: ChainId;
}) => {
  const positionRouterAddress = getContractAddress("PositionRouter", chainId);

  const router = getRouter({ chainId });
  return !(await router.approvedPlugins(account, positionRouterAddress));
};
