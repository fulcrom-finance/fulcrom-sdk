import { MaxUint256 } from "@ethersproject/constants";

import { getErc20 } from "../../contracts/ERC20";
import { Address, ChainId, Token } from "../../types";
import { getProvider } from "../../utils";

export const approveTokenTxData = async (
  account: Address,
  chainId: ChainId,
  token: Pick<Token, "address" | "symbol">,
  spender: Address
) => {
  const signer = getProvider(chainId).getSigner();

  const erc20 = getErc20(token.address, {
    signerOrProvider: signer,
    chainId,
  });

  return {
    to: token.address,
    from: account,
    data: erc20.interface.encodeFunctionData("approve", [spender, MaxUint256]),
  };
};
