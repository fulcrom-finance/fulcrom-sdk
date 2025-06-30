import { keccak256 } from "@ethersproject/solidity";
import { Address } from "../types";

export const getPositionKey = ({
  account,
  toToken,
  isLong,
  collateralTokenAddress,
}: {
  account: Address;
  toToken: Address;
  isLong: boolean;
  collateralTokenAddress?: Address;
}) => {
  return keccak256(
    ["address", "address", "address", "bool"],
    [account, collateralTokenAddress, toToken, isLong]
  );
};
