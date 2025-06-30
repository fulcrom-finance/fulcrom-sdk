import { ethers } from "ethers";

/**
 * Checks if the given address is a valid EVM address.
 * @param address The address to verify.
 * @returns True if the address is valid, otherwise false.
 */
export function isEvmAddress(address: string): boolean {
    // Use ethers.js to validate the address format
    return ethers.utils.isAddress(address);
}


export function validateEvmAddress(address: string, erros: string[]) {
  if (!isEvmAddress(address)) {
    erros.push(`Invalid account address: ${address}`);
  }
}