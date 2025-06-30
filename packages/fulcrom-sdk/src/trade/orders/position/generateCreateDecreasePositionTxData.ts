import { getPositionRouter } from "../../../contracts/PositionRouter";
import { Address, ChainId } from "../../../types";
import { getProvider } from "../../../utils";
import { ContractDecreasePositionParams } from "./createDecreasePositionParams";

export const generateCreateDecreasePositionTxData = async ({
  account,
  chainId,
  plugin,
  contractParams,
}: {
  account: Address;
  chainId: ChainId;
  plugin: Address;
  contractParams: ContractDecreasePositionParams;
}) => {
  const signer = getProvider(chainId).getSigner();

  const positionRouter = getPositionRouter({
    signerOrProvider: signer,
    chainId,
  });

  const { params, override } = contractParams;
  const data = positionRouter.interface.encodeFunctionData(
    "createDecreasePosition",
    [params]
  );

  return {
    ...override,
    to: plugin,
    from: account,
    data,
  };
};
