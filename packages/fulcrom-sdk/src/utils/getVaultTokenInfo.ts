import {
  expandDecimals,
  getContractAddress,
  getIndexTokens,
  USDG_DECIMALS,
} from "../config";
import { getVaultReader } from "../contracts/VaultReader";
import { ChainId, Token } from "../types";

export const getVaultTokenInfo = async (chainId: ChainId) => {
  const vaultReader = getVaultReader({ chainId });

  const vaultAddress = getContractAddress("Vault", chainId);
  const positionManagerAddress = getContractAddress("PositionManager", chainId);
  const usdgAmount = expandDecimals(USDG_DECIMALS);
  const wethAddress = getContractAddress("NATIVE_TOKEN", chainId);

  const tokens = getIndexTokens(chainId);
  const tokenAddresses = tokens.map((v: Token) => v.address);

  const response = await vaultReader.getVaultTokenInfoV4(
    vaultAddress,
    positionManagerAddress,
    wethAddress,
    usdgAmount,
    tokenAddresses
  );

  return response;
};
