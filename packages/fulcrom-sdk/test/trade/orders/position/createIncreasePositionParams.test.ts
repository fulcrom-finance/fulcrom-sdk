import { buildCreateInCreasePositionParams } from "../../../../src/trade/orders/position/createIncreasePositionParams";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../../../src/trade/utils/path", () => ({
  getCreateIncreasePositionPath: jest.fn(),
}));
jest.mock("../../../../src/utils/numbers/parseValue", () => ({
  parseValue: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/positionFinalExecutionFee", () => ({
  getPositionFinalExecutionFee: jest.fn(),
}));
jest.mock("../../../../src/utils/nativeTokens/getNativeTokensInfo", () => ({
  getIsNative: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/priceLimit", () => ({
  getIncreasePositionPriceLimit: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/toValue", () => ({
  getToUsdMax: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/priceUpdateData", () => ({
  getPriceUpdateData: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/pythUpdateFee", () => ({
  getPythUpdateFee: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/createIncreasePositionFee", () => ({
  getCreateIncreasePositionFee: jest.fn(),
}));

import { getCreateIncreasePositionPath } from "../../../../src/trade/utils/path";
import { parseValue } from "../../../../src/utils/numbers/parseValue";
import { getPositionFinalExecutionFee } from "../../../../src/trade/utils/positionFinalExecutionFee";
import { getIsNative } from "../../../../src/utils/nativeTokens/getNativeTokensInfo";
import { getIncreasePositionPriceLimit } from "../../../../src/trade/utils/priceLimit";
import { getToUsdMax } from "../../../../src/trade/utils/toValue";
import { getPriceUpdateData } from "../../../../src/trade/utils/priceUpdateData";
import { getPythUpdateFee } from "../../../../src/trade/utils/pythUpdateFee";
import { getCreateIncreasePositionFee } from "../../../../src/trade/utils/createIncreasePositionFee";

describe("buildCreateInCreasePositionParams", () => {
  const mockRequest = {
    chainId: 25,
    account: "0xabc",
    fromTokenInfo: { address: "0xfrom", decimals: 18, symbol: "ETH" },
    fromAmount: "1000",
    toTokenInfo: { address: "0xto", decimals: 18, symbol: "BTC" },
    isLong: true,
    collateralTokenInfo: { address: "0xcollateral", decimals: 18, symbol: "USDT" },
    orderType: 0,
    leverageRatio: 2,
    allowedSlippageAmount: 50,
    caches: new Map(),
    takeProfitPrice: BigNumber.from(1500),
    stopLossPrice: BigNumber.from(900),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (getCreateIncreasePositionPath as jest.Mock).mockReturnValue(["0xfrom", "0xto"]);
    (parseValue as jest.Mock).mockReturnValue(BigNumber.from(1000));
    (getPositionFinalExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(123));
    (getIsNative as jest.Mock).mockReturnValue(false);
    (getIncreasePositionPriceLimit as jest.Mock).mockReturnValue(BigNumber.from(2000));
    (getToUsdMax as jest.Mock).mockResolvedValue(BigNumber.from(3000));
    (getPriceUpdateData as jest.Mock).mockResolvedValue(["priceData"]);
    (getPythUpdateFee as jest.Mock).mockResolvedValue(BigNumber.from(10));
    (getCreateIncreasePositionFee as jest.Mock).mockResolvedValue(BigNumber.from(1337));
  });

  it("returns correct contract params structure", async () => {
    const result = await buildCreateInCreasePositionParams(mockRequest);

    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("override");
    expect(result.params.amountIn.toString()).toBe("1000");
    expect(result.params.indexToken).toBe("0xto");
    expect(result.params.sizeDelta.toString()).toBe("3000");
    expect(result.params.isLong).toBe(true);
    expect(result.params.acceptablePrice.toString()).toBe("2000");
    expect(result.params.hasCollateralInETH).toBe(false);
    expect(result.params.path).toEqual(["0xfrom", "0xto"]);
    expect(result.params.priceData).toEqual(["priceData"]);
    expect(result.params.executionFee.toString()).toBe("123");
    expect(result.params.tp.toString()).toBe("1500");
    expect(result.params.sl.toString()).toBe("900");
    expect(result.override.value).toBe("1337");
  });
});
