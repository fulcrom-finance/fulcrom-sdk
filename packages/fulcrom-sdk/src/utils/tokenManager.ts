import { getTokensInfo } from "./getTokensInfo";
import { getIsNative, getNativeTokensInfo } from "./nativeTokens";
import {
  TokenInfoMap,
  Address,
  ChainId,
  BasicTokenInfo,
  TokenInfo,
} from "../types";
import { getIndexTokens, getTokenBySymbolSafe, TokenSymbol } from "../config";

export class TokenManager {
  private tokensInfo: TokenInfoMap = {};
  private nativeTokensInfo?: BasicTokenInfo;

  public async loadTokensInfo(
    account: Address,
    chainId: ChainId,
    caches: Map<string, any>
  ) {
    this.tokensInfo = await getTokensInfo({
      account,
      chainId,
      tokens: [...getIndexTokens(chainId)],
      caches,
    });
  }

  public async loadNativeTokensInfo(
    account: Address,
    chainId: ChainId,
    caches: Map<string, any>
  ) {
    this.nativeTokensInfo = await getNativeTokensInfo({
      account,
      chainId,
      caches,
    });
  }

  public getTokenBySymbol = (symbol: TokenSymbol, chainId: ChainId) => {
    const token = getTokenBySymbolSafe(symbol, chainId);
    if (token) {
      if (getIsNative(symbol, chainId)) {
        return { ...this.tokensInfo[token.address], ...this.nativeTokensInfo };
      }
      return this.tokensInfo[token.address];
    }
  };

  public getTokenByAddress = (address: Address): TokenInfo | undefined => {
    return this.tokensInfo[address];
  };

  public getTokensInfo() {
    return this.tokensInfo;
  }

  public getNativeTokensInfo() {
    return this.nativeTokensInfo;
  }
}
