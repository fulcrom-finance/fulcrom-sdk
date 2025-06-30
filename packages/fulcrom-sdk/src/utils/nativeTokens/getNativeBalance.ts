import { Address, ChainId } from "../../types";
import { getProvider } from "../getProvider";

export const getNativeBalance = ({
  account,
  chainId,
}: {
  account: Address;
  chainId: ChainId;
}) => {
  const staticProvider = getProvider(chainId);

  return staticProvider.getBalance(account);
};
