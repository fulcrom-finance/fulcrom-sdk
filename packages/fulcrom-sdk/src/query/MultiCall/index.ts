import { Interface } from "@ethersproject/abi";
import { ChainId } from "../../types";
import { getMultiCall } from "../../contracts/MultiCall";

export interface Call {
  address: string; // Address of the contract
  name: string; // Function name on the contract (example: balanceOf)
  params?: any[]; // Function params
}

export type MultiCallResponse<T> = T | null;

export const multiCall = async (
  chainId: ChainId,
  abi: any[],
  calls: Call[]
) => {
  // Note: Must use another provider for multicall on Defi Wallet
  const multi = getMultiCall({ signerOrProvider: undefined, chainId });
  const itf = new Interface(abi);

  const calldata = calls.map((call) => {
    return {
      target: call.address.toLowerCase(),
      callData: itf.encodeFunctionData(call.name, call.params),
    };
  });
  const returnData = await multi.callStatic.tryAggregate(true, calldata);
  const res = returnData.map((call: any, i: number) => {
    const [result, data] = call;

    return result ? itf.decodeFunctionResult(calls[i].name, data) : null;
  });

  return res;
};
