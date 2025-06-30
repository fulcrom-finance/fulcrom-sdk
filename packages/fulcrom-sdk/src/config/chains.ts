import type { ChainInfo } from "../types";
import { ChainId } from "../types";
import { getContractAddress } from "./address";
import { getDefaultFulcromRpcUrl } from "./constants";
import { PYTH_TOKEN_ID_BY_CHAIN_ID } from "./pythTokenId";

export const explorers: Record<ChainId, string> = {
  [ChainId.CRONOS_MAINNET]: "https://explorer.cronos.org",
  [ChainId.CRONOS_TESTNET]: "https://explorer.cronos.org/testnet",
};

export const chainInfoList: ChainInfo[] = [
  {
    isTestnet: false,
    chainId: ChainId.CRONOS_MAINNET,
    label: "Cronos",
    explorer: explorers[ChainId.CRONOS_MAINNET],
    rpcUrl:
      process.env.FULCROM_SDK_RPC_URL ??
      getDefaultFulcromRpcUrl(ChainId.CRONOS_MAINNET),
    wsUrl:
      process.env.FULCROM_SDK_RPC_URL ??
      getDefaultFulcromRpcUrl(ChainId.CRONOS_MAINNET),
    ensAddress: getContractAddress("CronosId", ChainId.CRONOS_MAINNET),
    wrappedCurrency: {
      address: getContractAddress("NATIVE_TOKEN", ChainId.CRONOS_MAINNET),
      name: "WCRO",
      symbol: "WCRO",
      decimals: 18,
      image: "",
    },
    nativeCurrency: {
      address: getContractAddress("NATIVE_TOKEN", ChainId.CRONOS_MAINNET),
      candlePriceSymbol: "cro_usd",
      pythTokenId: PYTH_TOKEN_ID_BY_CHAIN_ID[ChainId.CRONOS_MAINNET].CRO,
      baseTokenSymbol: "CRO",
      baseTokenImage: "/tokens/cro.svg",
      name: "CRO",
      symbol: "CRO",
      decimals: 18,
      remainForSafeAmount: 3,
      isStable: false,
      displayDecimals: 2,
      displaySymbol: "CRO",
      image: "/tokens/cro.svg",
      color: "#2C3765", // color from icon
      listedAt: 1733990400000,
    },
  },
  {
    isTestnet: true,
    chainId: ChainId.CRONOS_TESTNET,
    label: "Cronos Testnet",
    explorer: explorers[ChainId.CRONOS_TESTNET],
    rpcUrl:
      process.env.FULCROM_SDK_RPC_URL ??
      getDefaultFulcromRpcUrl(ChainId.CRONOS_TESTNET),
    wsUrl:
      process.env.FULCROM_SDK_RPC_URL ??
      getDefaultFulcromRpcUrl(ChainId.CRONOS_TESTNET),
    ensAddress: getContractAddress("CronosId", ChainId.CRONOS_TESTNET),
    wrappedCurrency: {
      address: getContractAddress("NATIVE_TOKEN", ChainId.CRONOS_TESTNET),
      name: "WCRO",
      symbol: "WCRO",
      decimals: 18,
      image: "",
    },
    nativeCurrency: {
      address: getContractAddress("NATIVE_TOKEN", ChainId.CRONOS_TESTNET),
      candlePriceSymbol: "cro_usd",
      pythTokenId: PYTH_TOKEN_ID_BY_CHAIN_ID[ChainId.CRONOS_TESTNET].CRO,
      baseTokenSymbol: "CRO",
      baseTokenImage: "/tokens/cro.svg",
      name: "CRO",
      symbol: "CRO",
      decimals: 18,
      remainForSafeAmount: 3,
      isStable: false,
      displayDecimals: 2,
      displaySymbol: "CRO",
      image: "/tokens/cro.svg",
      color: "#2C3765", // color from icon
      listedAt: 1733990400000,
    },
  },
];

export const getChainInfo = (chainId: ChainId) => {
  return chainInfoList.find((v) => v.chainId === chainId) as ChainInfo;
};

export const DEFAULT_CHAIN_ID =
  process.env.FULCROM_SDK_DEFAULT_CHAIN_ID ?? ChainId.CRONOS_MAINNET;

export const MAINNET_CHAIN_IDS = chainInfoList
  .filter((v) => !v.isTestnet)
  .map((v) => v.chainId);

export const TESTNET_CHAIN_IDS = chainInfoList
  .filter((v) => v.isTestnet)
  .map((v) => v.chainId);
export const isValidChainId = (chainId: number): chainId is ChainId => {
  return (
    MAINNET_CHAIN_IDS.includes(chainId) || TESTNET_CHAIN_IDS.includes(chainId)
  );
};
