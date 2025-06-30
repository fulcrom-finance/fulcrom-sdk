import { getPositionRouter } from "../../../contracts/PositionRouter";
import { Address, ChainId } from "../../../types";
import { getProvider } from "../../../utils";
import { ContractIncreasePositionParams } from "./createIncreasePositionParams";


export const generateCreateIncreasePositionTxData = async ({
  account,
  chainId,
  plugin,
  contractParams,
}: {
  account: Address;
  chainId: ChainId;
  plugin: Address;
  contractParams: ContractIncreasePositionParams;
}) => {
  const signer = getProvider(chainId).getSigner();

  const positionRouter = getPositionRouter({
    signerOrProvider: signer,
    chainId,
  });

  const { params, override } = contractParams;
  const data = positionRouter.interface.encodeFunctionData(
    "createIncreasePositionV2",
    [params]
  );

  return {
    ...override,
    to: plugin,
    from: account,
    data,
  };
};
