import { CircuitBreaker } from "../../abis";
import { getContractAddress, getNonStableTokens } from "../../config";
import { Address, ChainId, Token } from "../../types";
import { Call, multiCall } from "../MultiCall";
import { BigNumber } from "@ethersproject/bignumber";

export enum CirCuitBreakerCallMethod {
  pauseStartTime = "pauseStartTime",
  pauseEndTime = "pauseEndTime",
  maxLongToShortRatio = "maxLongToShortRatio",
  maxShortToLongRatio = "maxShortToLongRatio",
}

type CirCuitBreakerCallMethodType = {
  [key in CirCuitBreakerCallMethod]?: BigNumber;
};
export type CircuitBreakerTokenInfo = Token &
  CirCuitBreakerCallMethodType & {
    isCircuitBreakerActive?: boolean;
    circuitBreakerDuration?: BigNumber;
  };

export const getCircuitBreakerTokenInfoMap = async ({
  chainId,
  tokenAddress,
}: {
  chainId: ChainId;
  tokenAddress: Address;
}) => {
  const tradePairTokens = getNonStableTokens(chainId);
  const nonStableToken = tradePairTokens.find(
    (item) => item.address === tokenAddress
  );

  if (nonStableToken) {
    const callMethod = `${CirCuitBreakerCallMethod.pauseStartTime}|${CirCuitBreakerCallMethod.pauseEndTime}|${CirCuitBreakerCallMethod.maxLongToShortRatio}|${CirCuitBreakerCallMethod.maxShortToLongRatio}`;

    const callMethodArray = callMethod.split("|");

    const calls = callMethodArray.map((method: string): Call => {
      return {
        address: getContractAddress("CircuitBreaker", chainId),
        name: method,
        params: [tokenAddress],
      };
    });
    const multiCallData = await multiCall(chainId, CircuitBreaker, calls);

    if (!multiCallData) return undefined;

    const tokenCircuitBreakerInfo: CircuitBreakerTokenInfo = {
      ...nonStableToken,
      isCircuitBreakerActive: false,
      circuitBreakerDuration: BigNumber.from(0),
    };
    for (let j = 0; j < callMethodArray.length; j++) {
      const callMethodName = callMethodArray[j];
      const _data = multiCallData[j];
      tokenCircuitBreakerInfo[
        callMethodName as keyof CirCuitBreakerCallMethodType
      ] = _data ? _data[0] : BigNumber.from(0);
    }

    const current = BigNumber.from(new Date().getTime());
    const {
      pauseStartTime = BigNumber.from(0),
      pauseEndTime = BigNumber.from(0),
    } = tokenCircuitBreakerInfo;

    tokenCircuitBreakerInfo.circuitBreakerDuration = pauseEndTime
      .sub(pauseStartTime)
      .mul(1000);

    if (
      current >= pauseStartTime.mul(1000) && // Contract time does not have milliseconds, need to multiply 1000 manually to compare
      current <= pauseEndTime.mul(1000)
    ) {
      tokenCircuitBreakerInfo.isCircuitBreakerActive = true;
    }

    return tokenCircuitBreakerInfo;
  }

  return undefined;
};
