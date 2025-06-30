import { ChainId, UpdateOrderRequest } from "../../../types";
import { BigNumber } from "@ethersproject/bignumber";
import { IncreaseOrder } from "../../../query/graphql";
import { parseValue } from "../../../utils/numbers/parseValue";
import { USD_DECIMALS } from "../../../config";
import { getProvider } from "../../../utils";
import { getOrderBook } from "../../../contracts/OrderBook";
import appLogger from "../../../common/appLogger";

export type ContractUpdateIncreaseOrderParamsStruct = {
  orderIndex: string;
  sizeDelta: BigNumber;
  triggerPrice: BigNumber;
  triggerAboveThreshold: boolean;
  tp: BigNumber;
  sl: BigNumber;
};

export type ContractUpdateIncreaseOrderParams = {
  params: ContractUpdateIncreaseOrderParamsStruct;
  override: { value: string };
};

export async function buildUpdateIncreaseOrderParams(
  request: UpdateOrderRequest,
  decreaseOrder: IncreaseOrder[],
): Promise<ContractUpdateIncreaseOrderParams> {

  const newSl = getSlTpPrice(request.stopLossTriggerPrice);
  const newTp = getSlTpPrice(request.takeProfitTargetPrice);

  const index = decreaseOrder[0].index;
  const executionFee = await getUpdateIncreaseOrderExecutionFee(
    request.chainId,
    request.account,
    index,
    newTp,
    newSl
  );

  const params = {
    orderIndex: index,
    sizeDelta: parseValue(request.transactionAmount, USD_DECIMALS),
    triggerPrice: parseValue(request.triggerExecutionPrice, USD_DECIMALS),
    triggerAboveThreshold: decreaseOrder[0].triggerAboveThreshold,
    tp: newTp,
    sl: newSl
  };

  return {
    params: params,
    override: { value: executionFee?.gt(0) ? executionFee.toString() : "0" },
  };
}

export const getSlTpPrice = (
  slTpPrice?: string,
) => {
  const newSlTpPrice = (!slTpPrice || Number(slTpPrice) <= 0) ? BigNumber.from(0) : parseValue(slTpPrice, USD_DECIMALS);
  return newSlTpPrice 
}
 

export const getUpdateIncreaseOrderExecutionFee = async (
  chainId: ChainId,
  account: string,
  index: string,
  tpPrice: BigNumber,
  slPrice: BigNumber
) => {
  // it needs to pass account here, otherwise it will throw error.
  const signer = getProvider(chainId).getSigner(account);

  const orderBook = getOrderBook({
    signerOrProvider: signer,
    chainId,
  });
  // add try-catch to handle error
  try{
    const executionFee = await orderBook.quoteExecutionFeeAdjustment(
      account,
      index,
      tpPrice,
      slPrice
    );
    return executionFee;
  } catch(error: any){
    if (error.reason) {
      appLogger.error("Reason:", error.reason);
    }
  
    if (error.data) {
      appLogger.error("Revert data:", error.data);
    }
  
    if (error.code) {
      appLogger.error("Error code:", error.code);
    }
  }
  
};
