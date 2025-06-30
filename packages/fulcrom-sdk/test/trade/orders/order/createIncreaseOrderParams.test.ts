import { buildContractParamsForIncreaseOrder } from "../../../../src/trade/orders/order/createIncreaseOrderParams";
import { OrderType } from "../../../../src/trade/orders/types/orderType";
import { BigNumber } from "@ethersproject/bignumber";
import { ChainId } from "../../../../src/types/index";

jest.mock("../../../../src/trade/utils/toValue", () => ({
  getToUsdMax: jest.fn(),
}));
jest.mock("../../../../src/trade/utils/orderFinalExecutionFee", () => ({
  getOrderFinalExecutionFee: jest.fn(),
}));
jest.mock("../../../../src/utils/nativeTokens", () => ({
  getIsNative: jest.fn(),
}));
jest.mock("../../../../src/trade/orders/order/createIncreaseOrderParams", () => {
  const actual = jest.requireActual("../../../../src/trade/orders/order/createIncreaseOrderParams");
  return {
    ...actual,
    expandDecimals: jest.fn(() => BigNumber.from(100000000)), // 1e8
  };
});

import { getToUsdMax } from "../../../../src/trade/utils/toValue";
import { getOrderFinalExecutionFee } from "../../../../src/trade/utils/orderFinalExecutionFee";
import { getIsNative } from "../../../../src/utils/nativeTokens";

describe("buildContractParamsForIncreaseOrder", () => {
  const mockFromToken = {
    address: "0xfrom",
    symbol: "ETH",
  } as any;
  const mockToToken = {
    address: "0xto",
    symbol: "BTC",
  } as any;
  const mockCollateralToken = {
    address: "0xcollateral",
    symbol: "USDT",
  } as any;

  const baseParams = {
    chainId: ChainId.CRONOS_MAINNET,
    account: "0xabc",
    fromTokenInfo: mockFromToken,
    fromAmount: BigNumber.from(1000),
    toTokenInfo: mockToToken,
    isLong: true,
    collateralTokenInfo: mockCollateralToken,
    orderType: OrderType.Market,
    triggerPrice: BigNumber.from(2000),
    takeProfitPrice: BigNumber.from(3000),
    stopLossPrice: BigNumber.from(1500),
    caches: new Map(),
    leverageRatio: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getToUsdMax as jest.Mock).mockResolvedValue(BigNumber.from(200000000)); // 2e8
    (getOrderFinalExecutionFee as jest.Mock).mockResolvedValue(BigNumber.from(123));
    (getIsNative as jest.Mock).mockReturnValue(false);
  });

  it("returns correct contract params structure for non-native token", async () => {
    const result = await buildContractParamsForIncreaseOrder(baseParams);

    expect(result).toHaveProperty("params");
    expect(result).toHaveProperty("override");
    expect(result.params.path).toEqual([mockFromToken.address]);
    expect(result.params.amountIn).toEqual(baseParams.fromAmount);
    expect(result.params.indexToken).toEqual(mockToToken.address);
    expect(result.params.sizeDelta.toString()).toEqual("2"); // 2e8 / 1e8 = 2
    expect(result.params.collateralToken).toEqual(mockToToken.address);
    expect(result.params.isLong).toBe(true);
    expect(result.params.triggerPrice).toEqual(baseParams.triggerPrice);
    expect(result.params.triggerAboveThreshold).toBe(false); // Market order, isLong true
    expect(result.params.executionFee.toString()).toBe("123");
    expect(result.params.shouldWrap).toBe(false);
    expect(result.params.tp).toEqual(baseParams.takeProfitPrice);
    expect(result.params.sl).toEqual(baseParams.stopLossPrice);
    expect(result.override?.value).toBe("123");
  });

  it("returns correct override.value for native token", async () => {
    (getIsNative as jest.Mock).mockReturnValue(true);
    const result = await buildContractParamsForIncreaseOrder(baseParams);
    expect(result.params.shouldWrap).toBe(true);
    expect(result.override?.value).toBe(
      BigNumber.from(123).add(baseParams.fromAmount).toString()
    );
  });

  it("uses correct collateralToken for short", async () => {
    const params = { ...baseParams, isLong: false };
    const result = await buildContractParamsForIncreaseOrder(params);
    expect(result.params.collateralToken).toBe(mockCollateralToken.address);
  });

  it("sets triggerAboveThreshold correctly for StopMarket", async () => {
    const params = { ...baseParams, orderType: OrderType.StopMarket, isLong: true };
    const result = await buildContractParamsForIncreaseOrder(params);
    expect(result.params.triggerAboveThreshold).toBe(true);
    const params2 = { ...baseParams, orderType: OrderType.StopMarket, isLong: false };
    const result2 = await buildContractParamsForIncreaseOrder(params2);
    expect(result2.params.triggerAboveThreshold).toBe(false);
  });
});
