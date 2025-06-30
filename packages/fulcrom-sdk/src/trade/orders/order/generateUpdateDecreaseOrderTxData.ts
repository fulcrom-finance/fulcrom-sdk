import { getOrderBook } from "../../../contracts/OrderBook";
import { Address, ChainId } from "../../../types";
import { getProvider } from "../../../utils";
import { ContractUpdateDecreaseOrderParams } from "./updateDecreaseOrderParams";

export const generateUpdateDecreaseOrderTxData = async ({
  account,
  chainId,
  plugin,
  contractParams,
}: {
  account: Address;
  chainId: ChainId;
  plugin: Address;
  contractParams: ContractUpdateDecreaseOrderParams;
}) => {
  const signer = getProvider(chainId).getSigner();

  const orderBook = getOrderBook({
    signerOrProvider: signer,
    chainId,
  });
  const { params } = contractParams;
  const data = orderBook.interface.encodeFunctionData(
    "updateDecreaseOrder", 
    [
      params.orderIndex,
      params.collateralDelta,
      params.sizeDelta,
      params.triggerPrice,
      params.triggerAboveThreshold
    ]
  );

  return {
    override: {}, // keep empty otherwise sign failed
    to: plugin,
    from: account,
    data,
  };
};
