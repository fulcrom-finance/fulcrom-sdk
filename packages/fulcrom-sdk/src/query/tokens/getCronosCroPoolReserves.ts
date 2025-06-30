import { BigNumber } from "@ethersproject/bignumber";
import { getContractAddress } from "../../config";
import { getCronosCroPool } from "../../contracts/CronosPool";
import { ChainId } from "../../types";

export const getCronosCroPoolReserves = async (chainId: ChainId) => {
  const cronosCroPool = getCronosCroPool({ chainId });

  const reserves = await cronosCroPool.getReserves();
  const { _reserve0, _reserve1 } = reserves || {};

  let pairTokenReserve = _reserve0;
  let croReserve = _reserve1;

  const croContract = getContractAddress("NATIVE_TOKEN", chainId);
  const usdcContract = getContractAddress("USDC", chainId); // Current pool pair token is USDC(for zkEvm is vUSD)

  if (BigNumber.from(croContract).lt(BigNumber.from(usdcContract))) {
    pairTokenReserve = _reserve1;
    croReserve = _reserve0;
  }

  return {
    pairTokenReserve: pairTokenReserve,
    croReserve: croReserve,
  };
};
