import { getOrderBook } from "../../../contracts/OrderBook";
import { Address, ChainId } from "../../../types";
import { getProvider } from "../../../utils";
import { ContractIncreaseOrderV2Params } from "./createIncreaseOrderParams";

export const generateCreateIncreaseOrderTxData = async ({
  account,
  chainId,
  plugin,
  contractParams,
}: {
  account: Address;
  chainId: ChainId;
  plugin: Address;
  contractParams: ContractIncreaseOrderV2Params;
}) => {
  const signer = getProvider(chainId).getSigner();

  const orderBook = getOrderBook({
    signerOrProvider: signer,
    chainId,
  });

  const { params, override } = contractParams;
  const data = orderBook.interface.encodeFunctionData(
    "createIncreaseOrderV2",
    [params]
  );

  return {
    ...override,
    to: plugin,
    from: account,
    data,
  };
};
