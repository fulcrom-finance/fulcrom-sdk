import { BigNumber } from "@ethersproject/bignumber";
import { getEstimatedCancelFeeUsd } from "../../src/orders/getEstimatedCancelFeeUsd";
import { OrderType, Order } from "../../src/query/graphql";
import { ChainId } from "../../src/types/chain";

// Mock all dependencies for deterministic output
jest.mock("../../src/cache", () => ({
  getDataWithCache: jest.fn(() => Promise.resolve(BigNumber.from(42))),
  cacheKeys: { GasPrice: "GasPrice" },
}));
jest.mock("../../src/query/getGasPrice", () => ({
  getGasPrice: jest.fn(),
}));
jest.mock("../../src/query/orders/getCancelOrderParams", () => ({
  getCancelOrderParams: jest.fn(() => ({
    swapOrderIndexes: [1],
    increaseOrderIndexes: [2],
    decreaseOrderIndexes: [3],
  })),
}));
jest.mock("../../src/contracts/OrderBook", () => ({
  getOrderBook: jest.fn(() => "OrderBookContract"),
}));
jest.mock("../../src/utils/getPaymasterGasFeeQuery", () => ({
  getPaymasterGasFeeQuery: jest.fn(() => Promise.resolve(BigNumber.from(999))),
}));

describe("getEstimatedCancelFeeUsd", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const account = "0xAccount";
  const chainId = ChainId.CRONOS_MAINNET;
  const orders: Order[] = [
    {
      type: OrderType.IncreaseOrder,
      id: "order1",
      index: "1",
      account: "0xAccount" as any,
      isLong: true,
      executionFee: BigNumber.from(0),
      indexToken: "0xTokenB",
      purchaseToken: "0xTokenA",
      collateralToken: "0xTokenC",
      purchaseTokenAmount: BigNumber.from(100),
      sizeDelta: BigNumber.from(200),
      triggerPrice: BigNumber.from(20),
      triggerAboveThreshold: false,
      timestamp: 0,
      sl: BigNumber.from(0),
      tp: BigNumber.from(0),
      tpSlExecutionFee: BigNumber.from(0),
    },
  ];
  const caches = new Map();

  it("returns the value from getPaymasterGasFeeQuery", async () => {
    const result = await getEstimatedCancelFeeUsd({ account, chainId, orders }, caches);
    expect(result.toString()).toBe("999");
  });

  it("calls getDataWithCache with correct args", async () => {
    const { getDataWithCache } = require("../../src/cache");
    await getEstimatedCancelFeeUsd({ account, chainId, orders }, caches);
    expect(getDataWithCache).toHaveBeenCalledWith(
      caches,
      "GasPrice",
      expect.any(Function),
      chainId
    );
  });

  it("calls getCancelOrderParams with correct orders", async () => {
    const { getCancelOrderParams } = require("../../src/query/orders/getCancelOrderParams");
    await getEstimatedCancelFeeUsd({ account, chainId, orders }, caches);
    expect(getCancelOrderParams).toHaveBeenCalledWith({ orders });
  });

  it("calls getPaymasterGasFeeQuery with correct params", async () => {
    const { getPaymasterGasFeeQuery } = require("../../src/utils/getPaymasterGasFeeQuery");
    await getEstimatedCancelFeeUsd({ account, chainId, orders }, caches);
    expect(getPaymasterGasFeeQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        chainId,
        getContract: expect.any(Function),
        functionName: "cancelMultiple",
        account,
        gasPrice: BigNumber.from(42),
        overrides: {},
        params: [[1], [2], [3]],
      })
    );
  });
});
