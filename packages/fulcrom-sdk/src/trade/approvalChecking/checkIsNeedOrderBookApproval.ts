import { getContractAddress } from "../../config";
import { getRouter } from "../../contracts/Router";
import { Address, ChainId } from "../../types";

export const checkIsNeedOrderBookApproval = async ({
  account,
  chainId,
}: {
  account: Address;
  chainId: ChainId;
}) => {
  const router = getRouter({ chainId });
  const orderBookAddress = getContractAddress("OrderBook", chainId);
  return !(await router.approvedPlugins(account, orderBookAddress));
};
