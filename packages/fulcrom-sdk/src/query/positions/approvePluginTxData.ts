import { getContractAddress } from "../../config";
import { getRouter } from "../../contracts/Router";
import { Address, ChainId } from "../../types";
import { getProvider } from "../../utils";

export const approvePluginTxData = ({
  account,
  chainId,
  plugin,
}: {
  account: Address;
  chainId: ChainId;
  plugin: Address;
}) => {
  const signer = getProvider(chainId).getSigner();
  return {
    to: getContractAddress("Router", chainId),
    from: account,
    data: getRouter({
      signerOrProvider: signer,
      chainId,
    }).interface.encodeFunctionData("approvePlugin", [plugin]),
  };
};
