import { getOrderBook } from "../../../contracts/OrderBook";
import { Address, ChainId } from "../../../types";
import { getProvider } from "../../../utils";
import { ContractDecreaseOrderParams } from "./createDecreaseOrderParams";

export const generateCreateDecreaseOrderTxData = async ({
  account,
  chainId,
  plugin,
  contractParams,
}: {
  account: Address;
  chainId: ChainId;
  plugin: Address;
  contractParams: ContractDecreaseOrderParams;
}) => {
  const signer = getProvider(chainId).getSigner();

  const orderBook = getOrderBook({
    signerOrProvider: signer,
    chainId,
  });
  const { params, override } = contractParams;
  const data = orderBook.interface.encodeFunctionData(
    "createDecreaseOrder", 
    [
      params.indexToken,
      params.sizeDelta,
      params.collateralToken,
      params.collateralDelta,
      params.isLong,
      params.triggerPrice,
      params.triggerAboveThreshold
    ]
  );

  return {
    ...override,
    to: plugin,
    from: account,
    data,
  };
};
