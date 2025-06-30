import { BigNumber } from "@ethersproject/bignumber";
import type { BaseContract } from "@ethersproject/contracts";
import {
  Address,
  ChainId,
  Erc20Token,
  NativeToken,
  PayGasToken,
} from "../types";
import { GetContractOptionsByChainId } from "./getContract";
import { getProvider } from "./getProvider";
import { UserOverrides } from "./zify";
import { safeTry } from "./safeTry";

export type GasFee = Quotes;

export type Quote =
  | {
      isNativeGas: false;
      tokenAddress: Address;
      gasTokenDecimal: number;
      gasTokenAmount: BigNumber;
      gasTokenUsd: BigNumber;
      gasToken: Erc20Token;
    }
  | { isNativeGas: true; gasTokenAmount: BigNumber; gasToken: NativeToken };
export type Quotes = Quote[];

export const getPaymasterGasFee = async <
  Contract extends BaseContract,
  FunctionName extends keyof Contract["functions"] & string,
  Params extends Parameters<Contract["functions"][FunctionName]>
>({
  chainId,
  params,
  functionName,
  getContract,
  overrides,
  gasTokens = [],
  account,
  gasPrice,
}: {
  chainId: ChainId;
  params: Params;
  functionName: FunctionName;
  gasPrice: BigNumber;
  account: string;
  getContract: (p: GetContractOptionsByChainId) => Contract;
  overrides: UserOverrides;
  gasTokens?: PayGasToken[];
}): Promise<GasFee | undefined> => {
  const provider = getProvider(chainId);

  if (!account || !gasPrice) {
    return;
  }
  const contract = getContract({
    signerOrProvider: provider?.getSigner(account),
    chainId: chainId,
  });

  const gasLimit =
    overrides.gasLimit ??
    (await safeTry(() =>
      contract.estimateGas[functionName](...params, overrides)
    ));

  // don't support CRONOS_ZKEVM_MAINNET for now
  // const shouldUsePaymaster = getIsChainPaymasterSupported(chainId);

  // const funData = contract.interface.encodeFunctionData(functionName, params);
  const nativeToken = gasTokens.filter((v): v is NativeToken => !!v.isNative);

  const quotes: Quotes = [];
  // if (shouldUsePaymaster) {
  //   const zyfiDatas =
  //     (await safeTry(() =>
  //       getZyfiDataBatch({
  //         gasLimit: gasLimit,
  //         fromAddress: account,
  //         gasTokenAddresses: erc20Tokens.map((v) => v.address),
  //         toAddress: contract.address,
  //         functionData: funData,
  //         value: overrides.value,
  //       })
  //     )) ?? [];

  //   const erc20GasFees: Quotes = zyfiDatas.map((zyfiData, index) => {
  //     return {
  //       isNativeGas: false,
  //       gasToken: erc20Tokens[index],
  //       tokenAddress: zyfiData.tokenAddress,
  //       // keep this decimal as it may be different from project setting
  //       gasTokenDecimal: parseInt(zyfiData.feeTokendecimals),
  //       gasTokenAmount: BigNumber.from(zyfiData.feeTokenAmount),
  //       // testnet response is in 8 decimal, mainnet response is in 0 decimal convert to project usd decimal bignumber (30)
  //       gasTokenUsd: parseValue(
  //         zyfiData.feeUSD,
  //         isMainnet ? USD_DECIMALS : USD_DECIMALS - 8
  //       ),
  //     };
  //   });

  //   quotes.push(...erc20GasFees);
  // }

  if (gasLimit) {
    quotes.push({
      isNativeGas: true,
      gasToken: nativeToken[0],
      gasTokenAmount: gasLimit.mul(gasPrice),
    });
  }
  return quotes;
};
