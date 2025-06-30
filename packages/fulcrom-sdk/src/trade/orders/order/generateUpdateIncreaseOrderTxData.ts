import { getOrderBook } from "../../../contracts/OrderBook";
import { Address, ChainId } from "../../../types";
import { getProvider } from "../../../utils";
import { ContractUpdateIncreaseOrderParams } from "./updateIncreaseOrderParams";

export const generateUpdateIncreaseOrderTxData = async ({
  account,
  chainId,
  plugin,
  contractParams,
}: {
  account: Address;
  chainId: ChainId;
  plugin: Address;
  contractParams: ContractUpdateIncreaseOrderParams;
}) => {
  const signer = getProvider(chainId).getSigner();

  const orderBook = getOrderBook({
    signerOrProvider: signer,
    chainId,
  });
  const { params,override } = contractParams;
  
  const data = orderBook.interface.encodeFunctionData(
    "updateIncreaseOrderV2", 
    [
      params.orderIndex,
      params.sizeDelta,
      params.triggerPrice,
      params.triggerAboveThreshold,
      params.tp,
      params.sl
    ]
  );
  return {
    ...override,
    to: plugin,
    from: account,
    data,
  };
};
