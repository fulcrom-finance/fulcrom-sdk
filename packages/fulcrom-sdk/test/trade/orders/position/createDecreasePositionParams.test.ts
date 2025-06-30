import { buildCreateDeCreasePositionParams } from "../../../../src/trade/orders/position/createDecreasePositionParams";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../../../src/config", () => ({
  getTokenBySymbol: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/path", () => ({
  getCreateDecreasePositionPath: jest.fn(),
}));
jest.mock("../../../../src/utils/nativeTokens/getNativeTokensInfo", () => ({
  getIsNative: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/minExecutionFee", () => ({
  getPositionMinExecutionFee: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/priceLimit", () => ({
  getDecreasePositionPriceLimit: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/priceUpdateData", () => ({
  getPriceUpdateData: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/pythUpdateFee", () => ({
  getPythUpdateFee: jest.fn(),
}));
jest.mock("../../../../src/positions/utils/getSizeDelta", () => ({
  getSizeDelta: jest.fn(),
}));
jest.mock("../../../../src/positions/utils/getCollateralDelta", () => ({
  getCollateralDelta: jest.fn(),
}));

import { getTokenBySymbol } from "../../../../src/config";
import { getCreateDecreasePositionPath } from "../../../../src/trade/utils/path";
import { getIsNative } from "../../../../src/utils/nativeTokens/getNativeTokensInfo";
import { getPositionMinExecutionFee } from "../../../../src/trade/utils/minExecutionFee";
import { getDecreasePositionPriceLimit } from "../../../../src/trade/utils/priceLimit";
import { getPriceUpdateData } from "../../../../src/trade/utils/priceUpdateData";
import { getPythUpdateFee } from "../../../../src/trade/utils/pythUpdateFee";
import { getSizeDelta } from "../../../../src/positions/utils/getSizeDelta";
import { getCollateralDelta } from "../../../../src/positions/utils/getCollateralDelta";

describe("buildCreateDeCreasePositionParams", () => {
  const mockPosition = {
    indexToken: "0xindex",
    collateralToken: "0xcollateral",
    isLong: false,
  } as any;

  const mockDecreaseOrders = [
    { index: "1" }
  ] as any[];

  const chainId = 25;
  const account = "0xabc";
  const isMarket = true;
  const allowedSlippageAmount = 50;
  const decreaseAmount = "100";
  const triggerPrice = "1200";
  const isKeepLeverage = false;
  const caches = new Map();
  const receiveTokenSymbol = "USDT";

  beforeEach(() => {
    jest.clearAllMocks();
    (getTokenBySymbol as jest.Mock).mockReturnValue({ address: "0xusdt", symbol: "USDT" });
    (getCreateDecreasePositionPath as jest.Mock).mockReturnValue(["0xcollateral", "0xusdt"]);
    (getIsNative as jest.Mock).mockReturnValue(false);
    (getPositionMinExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(123));
    (getDecreasePositionPriceLimit as jest.Mock).mockReturnValue(BigNumber.from(2000));
    (getPriceUpdateData as jest.Mock).mockResolvedValue(["priceData"]);
    (getPythUpdateFee as jest.Mock).mockResolvedValue(BigNumber.from(10));
    (getSizeDelta as jest.Mock).mockReturnValue(BigNumber.from(50));
    (getCollateralDelta as jest.Mock).mockResolvedValue(BigNumber.from(25));
  });

  it("returns correct contract params structure", async () => {
    const result = await buildCreateDeCreasePositionParams(
      mockPosition,
      mockDecreaseOrders,
      chainId,
      account,
      isMarket,
      allowedSlippageAmount,
      decreaseAmount,
      triggerPrice,
      isKeepLeverage,
      caches,
      receiveTokenSymbol
    );

    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("override");
    expect(result.params.path).toEqual(["0xcollateral", "0xusdt"]);
    expect(result.params.indexToken).toBe("0xindex");
    expect(result.params.collateralDelta.toString()).toBe("25");
    expect(result.params.sizeDelta.toString()).toBe("50");
    expect(result.params.isLong).toBe(false);
    expect(result.params.receiver).toBe(account);
    expect(result.params.acceptablePrice.toString()).toBe("2000");
    expect(result.params.executionFee.toString()).toBe("123");
    expect(result.params.withdrawETH).toBe(false);
    expect(result.params.priceData).toEqual(["priceData"]);
    expect(result.override.value).toBe("133");
  });
});
