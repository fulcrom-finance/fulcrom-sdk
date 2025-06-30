export enum ChainName {
  CRONOS = "Cronos",
}

export enum ChainType {
  TestNet,
  MainNet,
}

export enum ChainId {
  CRONOS_MAINNET = 25,
  CRONOS_TESTNET = 338,
}

export interface ChainInfo {
  label: string;
  rpcUrl: string;
  wsUrl: string;
  chainId: ChainId;
  explorer: string;
  ensAddress: string;
  isTestnet: boolean;
  wrappedCurrency: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    image: string;
  };
  nativeCurrency: {
    address: string;
    candlePriceSymbol: `${string}_usd`;
    pythTokenId: string;
    baseTokenSymbol: string;
    baseTokenImage: string;
    isStable: boolean;
    name: string;
    symbol: "CRO" | "ETH";
    decimals: 18;
    remainForSafeAmount: number;
    displayDecimals: number;
    displaySymbol: string;
    image: string;
    color: string; // color from icon
    listedAt: number;
  };
}
