import { getReaderV2 } from "../contracts/ReaderV2";
import { Address, ChainId } from "../types";

export const getTokenBalances = async (
  account: Address,
  chainId: ChainId,
  tokens: Address[]
) => {
  const readerV2 = getReaderV2({ chainId });

  const response = await readerV2.getTokenBalances(account, tokens);

  return response;
};
