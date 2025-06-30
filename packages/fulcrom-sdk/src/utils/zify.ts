import type { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import type { Overrides } from "@ethersproject/contracts";
import { isTestnet } from "./getTokenList";
import { ChainId } from "../types";

const ZIFY_MIN_GAS_LIMIT = 150000; // hard min from zify service
export type UserOverrides = {
  gasLimit?: BigNumber;
  value?: BigNumber;
};
interface ZyfiResponse {
  txData: {
    chainId: number;
    from: string;
    to: string;
    data: string;
    value: string;
    customData: {
      paymasterParams: {
        paymaster: string;
        paymasterInput: string;
      };
      gasPerPubdata: number;
    };
    maxFeePerGas: string;
    gasLimit: number;
  };
  gasLimit: string;
  gasPrice: string;
  tokenAddress: string;
  tokenPrice: string;
  feeTokenAmount: string; // est gas fee in gas token ,
  feeTokendecimals: string;
  feeUSD: string; // est gas fee in usd
  estimatedFinalFeeTokenAmount: string;
  estimatedFinalFeeUSD: string;
}

export const getZyfiData = async (
  chainId: ChainId,
  {
    gasLimit,
    fromAddress,
    toAddress,
    functionData,
    gasTokenAddress,
    value,
  }: UserOverrides & {
    fromAddress: string;
    toAddress: string;
    functionData: string;
    gasTokenAddress: string;
  }
): Promise<ZyfiResponse> => {
  const payload = {
    chainId,
    isTestnet: isTestnet(chainId),
    // gasLimit need to be high enough, else will get BOOTLOADER-based tx failed error in explorer, refer to https://github.com/cronos-labs/h2-finance-app/blob/75e140ea9920d4fd6bb34f9feaeb7e70190b8a06/packages/h2-frontend/src/utils/contractCallGasOverrides.ts#L77
    gasLimit: gasLimit
      ? Math.max(gasLimit.toNumber(), ZIFY_MIN_GAS_LIMIT)
      : ZIFY_MIN_GAS_LIMIT,
    txData: {
      from: fromAddress,
      to: toAddress,
      data: functionData,
      value: value?.toString(),
    },
    feeTokenAddress: gasTokenAddress,
  };
  const response = await fetch("https://api.zyfi.org/api/erc20_paymaster/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
};

export const getZyfiDataBatch = async (
  chainId: ChainId,
  {
    gasLimit,
    fromAddress,
    toAddress,
    functionData,
    gasTokenAddresses,
    value,
  }: UserOverrides & {
    fromAddress: string;
    toAddress: string;
    functionData: string;
    gasTokenAddresses: string[];
  }
): Promise<ZyfiResponse[]> => {
  const payload = {
    chainId,
    isTestnet: isTestnet(chainId),
    // gasLimit need to be high enough, else will get BOOTLOADER-based tx failed error in explorer, refer to https://github.com/cronos-labs/h2-finance-app/blob/75e140ea9920d4fd6bb34f9feaeb7e70190b8a06/packages/h2-frontend/src/utils/contractCallGasOverrides.ts#L77
    gasLimit: gasLimit
      ? Math.max(gasLimit.toNumber(), ZIFY_MIN_GAS_LIMIT)
      : ZIFY_MIN_GAS_LIMIT,
    txData: {
      from: fromAddress,
      to: toAddress,
      data: functionData,
      value: value?.toString(),
    },
    feeTokenAddresses: gasTokenAddresses,
  };
  const response = await fetch(
    "https://api.zyfi.org/api/erc20_paymaster/v1/batch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return await response.json();
};

export type PaymasterOverrides = Pick<
  Overrides,
  "gasLimit" | "customData" | "maxFeePerGas"
> & {
  gasPrice: BigNumberish;
};

export const zifyResponseToPaymasterOverrides = (
  zify: ZyfiResponse
): PaymasterOverrides => {
  return {
    gasPrice: zify.gasPrice,
    customData: zify.txData.customData,
    gasLimit: zify.txData.gasLimit,
    maxFeePerGas: zify.txData.maxFeePerGas,
  };
};
