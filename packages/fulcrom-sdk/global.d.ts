declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly FULCROM_SDK_RPC_URL_25: string;
      readonly FULCROM_SDK_WS_URL_25: string;

      readonly FULCROM_SDK_DEFAULT_CHAIN_ID: string;
      readonly FULCROM_SDK_RPC_URL_338: string;
      readonly FULCROM_SDK_WS_URL_338: string;

      readonly FULCROM_SDK_PUBLIC_CANDLE_ENDPOINT: string;

      readonly PYTH_NETWORK: string;
    }
  }
}

// don't remove the empty export
export {};
