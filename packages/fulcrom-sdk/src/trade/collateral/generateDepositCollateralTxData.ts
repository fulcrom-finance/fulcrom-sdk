
import { getPositionRouter } from "../../contracts/PositionRouter";
import { Address, ChainId } from "../../types";
import { getProvider } from "../../utils/getProvider";
import { ContractIncreasePositionParams } from "./buildDepositCollateralParams";


export const generateDepositCollateralTxData = async ({
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

  const { params, amountIn, override } = contractParams;
  const data = positionRouter.interface.encodeFunctionData(
    "createIncreasePosition",
    [params,amountIn]
  );
  
  return {
    ...override,
    to: plugin,
    from: account,
    data,
  };
};
