import { validateDecreaseAmount } from "../../../../src/trade/decrease/paramsValidation/validateDecreaseAmount";
import { BigNumber } from "ethers";
import { ChainId } from "../../../../src/types";

// Always provide all required fields for each object
const mockAddress = "0x123";
const mockChainId = ChainId.CRONOS_TESTNET;

const baseReceiveTokenInfo = {
  availableAmount: BigNumber.from("1000"),
  bufferAmount: BigNumber.from("0"),
  poolAmount: BigNumber.from("1000"),
};
const baseCollateralTokenInfo = {
  usdgAmount: BigNumber.from("0"),
  maxUsdgAmount: BigNumber.from("10000"),
  symbol: "USDT",
};
const basePosition = {
  size: BigNumber.from("1000"),
};

// Use a factory function for the config mock to avoid hoisting issues
jest.mock("../../../../src/config", () => {
  const { BigNumber } = require("ethers");
  return {
    expandDecimals: jest.fn(() => BigNumber.from(1)),
    ONE_USD: BigNumber.from(1),
    USDG_DECIMALS: 18,
    MIN_LEVERAGE: 1,
    BASIS_POINTS_DIVISOR: 10000,
    MIN_POSITION_USD: BigNumber.from(10),
    MIN_COLLATERAL: BigNumber.from(10),
  };
});

jest.mock("../../../../src/trade/decrease/utils/getIsNeedSwap", () => ({
  getIsNeedSwap: jest.fn(),
}));
jest.mock("../../../../src/trade/decrease/utils/getReceiveAmount", () => ({
  getReceiveUsd: jest.fn(),
  getReceiveAmount: jest.fn(),
}));
jest.mock("../../../../src/positions/utils/getIsClosing", () => ({
  getIsClosing: jest.fn(),
}));
jest.mock("../../../../src/trade/decrease/utils/getNextLeverage", () => ({
  getNextLeverage: jest.fn(),
}));
jest.mock("../../../../src/utils/insaneMode/getUserMaxLeverage", () => ({
  getUserMaxLeverage: jest.fn(),
}));
jest.mock("../../../../src/trade/decrease/utils/getNextCollateral", () => ({
  getNextCollateral: jest.fn(),
}));
jest.mock("../../../../src/utils/numbers/parseValue", () => ({
  parseValue: (val: string) => require("ethers").BigNumber.from(val),
}));

describe("validateDecreaseAmount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if decreaseAmount exceeds position size", async () => {
    require("../../../../src/positions/utils/getIsClosing").getIsClosing.mockReturnValue(false);
    require("../../../../src/trade/decrease/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from("20000"));
    require("../../../../src/utils/insaneMode/getUserMaxLeverage").getUserMaxLeverage.mockResolvedValue(50);
    require("../../../../src/trade/decrease/utils/getNextCollateral").getNextCollateral.mockResolvedValue(BigNumber.from("1000"));
    const position = { ...basePosition, size: BigNumber.from("1000") };
    const params = {
      account: mockAddress,
      receiveTokenInfo: { ...baseReceiveTokenInfo },
      position,
      isMarket: false,
      isKeepLeverage: false,
      chainId: mockChainId,
      decreaseAmount: "2001",
      decreaseOrders: [{ sizeDelta: BigNumber.from("1000") }],
      collateralTokenInfo: { ...baseCollateralTokenInfo },
      caches: new Map(),
    };
    const errors = await validateDecreaseAmount(params as any);
    expect(errors).toContain("This exceeds your current max position");
  });

  it("should return error if insufficient receive token liquidity when swap is needed", async () => {
    require("../../../../src/trade/decrease/utils/getIsNeedSwap").getIsNeedSwap.mockReturnValue(true);
    require("../../../../src/trade/decrease/utils/getReceiveAmount").getReceiveAmount.mockResolvedValue(BigNumber.from("2000"));
    require("../../../../src/trade/decrease/utils/getReceiveAmount").getReceiveUsd.mockResolvedValue(BigNumber.from("100"));
    require("../../../../src/positions/utils/getIsClosing").getIsClosing.mockReturnValue(false);
    require("../../../../src/trade/decrease/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from("20000"));
    require("../../../../src/utils/insaneMode/getUserMaxLeverage").getUserMaxLeverage.mockResolvedValue(50);
    require("../../../../src/trade/decrease/utils/getNextCollateral").getNextCollateral.mockResolvedValue(BigNumber.from("1000"));
    const params = {
      account: mockAddress,
      receiveTokenInfo: { ...baseReceiveTokenInfo },
      position: { ...basePosition },
      isMarket: false,
      isKeepLeverage: false,
      chainId: mockChainId,
      decreaseAmount: "100",
      decreaseOrders: [{ sizeDelta: BigNumber.from("1000") }],
      collateralTokenInfo: { ...baseCollateralTokenInfo },
      caches: new Map(),
    };
    const errors = await validateDecreaseAmount(params as any);
    expect(errors).toContain("Insufficient receive token liquidity");
  });

  it("should return error if collateral pool capacity exceeded when swap is needed", async () => {
    require("../../../../src/trade/decrease/utils/getIsNeedSwap").getIsNeedSwap.mockReturnValue(true);
    require("../../../../src/trade/decrease/utils/getReceiveAmount").getReceiveAmount.mockResolvedValue(BigNumber.from("100"));
    require("../../../../src/trade/decrease/utils/getReceiveAmount").getReceiveUsd.mockResolvedValue(BigNumber.from("100000000000000000000000"));
    require("../../../../src/positions/utils/getIsClosing").getIsClosing.mockReturnValue(false);
    require("../../../../src/trade/decrease/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from("20000"));
    require("../../../../src/utils/insaneMode/getUserMaxLeverage").getUserMaxLeverage.mockResolvedValue(50);
    require("../../../../src/trade/decrease/utils/getNextCollateral").getNextCollateral.mockResolvedValue(BigNumber.from("1000"));
    const params = {
      account: mockAddress,
      receiveTokenInfo: { ...baseReceiveTokenInfo },
      position: { ...basePosition },
      isMarket: false,
      isKeepLeverage: false,
      chainId: mockChainId,
      decreaseAmount: "100",
      decreaseOrders: [{ sizeDelta: BigNumber.from("1000") }],
      collateralTokenInfo: { ...baseCollateralTokenInfo, usdgAmount: BigNumber.from("10000"), maxUsdgAmount: BigNumber.from("10000") },
      caches: new Map(),
    };
    const errors = await validateDecreaseAmount(params as any);
    expect(errors.some((e: string) => e.includes("pool exceeded"))).toBe(true);
  });

  it("should return error if next leverage is below min", async () => {
    require("../../../../src/positions/utils/getIsClosing").getIsClosing.mockReturnValue(false);
    require("../../../../src/trade/decrease/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from("5000")); // 0.5x
    require("../../../../src/utils/insaneMode/getUserMaxLeverage").getUserMaxLeverage.mockResolvedValue(50);
    require("../../../../src/trade/decrease/utils/getNextCollateral").getNextCollateral.mockResolvedValue(BigNumber.from("1000"));
    const params = {
      account: mockAddress,
      receiveTokenInfo: { ...baseReceiveTokenInfo },
      position: { ...basePosition },
      isMarket: false,
      isKeepLeverage: false,
      chainId: mockChainId,
      decreaseAmount: "100",
      decreaseOrders: [{ sizeDelta: BigNumber.from("1000") }],
      collateralTokenInfo: { ...baseCollateralTokenInfo },
      caches: new Map(),
    };
    const errors = await validateDecreaseAmount(params as any);
    expect(errors.some((e: string) => e.includes("Min leverage"))).toBe(true);
  });

  it("should return error if next leverage is above max", async () => {
    require("../../../../src/positions/utils/getIsClosing").getIsClosing.mockReturnValue(false);
    require("../../../../src/trade/decrease/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from("600000")); // 60x
    require("../../../../src/utils/insaneMode/getUserMaxLeverage").getUserMaxLeverage.mockResolvedValue(50);
    require("../../../../src/trade/decrease/utils/getNextCollateral").getNextCollateral.mockResolvedValue(BigNumber.from("1000"));
    const params = {
      account: mockAddress,
      receiveTokenInfo: { ...baseReceiveTokenInfo },
      position: { ...basePosition },
      isMarket: false,
      isKeepLeverage: false,
      chainId: mockChainId,
      decreaseAmount: "100",
      decreaseOrders: [{ sizeDelta: BigNumber.from("1000") }],
      collateralTokenInfo: { ...baseCollateralTokenInfo },
      caches: new Map(),
    };
    const errors = await validateDecreaseAmount(params as any);
    expect(errors.some((e: string) => e.includes("Max leverage"))).toBe(true);
  });

  it("should return error if leftover size is below minimum", async () => {
    require("../../../../src/positions/utils/getIsClosing").getIsClosing.mockReturnValue(false);
    require("../../../../src/trade/decrease/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from("20000")); // 2x
    require("../../../../src/utils/insaneMode/getUserMaxLeverage").getUserMaxLeverage.mockResolvedValue(50);
    require("../../../../src/trade/decrease/utils/getNextCollateral").getNextCollateral.mockResolvedValue(BigNumber.from("1000"));
    const params = {
      account: mockAddress,
      receiveTokenInfo: { ...baseReceiveTokenInfo },
      position: { ...basePosition, size: BigNumber.from("15") },
      isMarket: false,
      isKeepLeverage: false,
      chainId: mockChainId,
      decreaseAmount: "10",
      decreaseOrders: [{ sizeDelta: BigNumber.from("1000") }],
      collateralTokenInfo: { ...baseCollateralTokenInfo },
      caches: new Map(),
    };
    const errors = await validateDecreaseAmount(params as any);
    expect(errors.some((e: string) => e.includes("Leftover size below"))).toBe(true);
  });

  it("should return error if leftover collateral is below minimum", async () => {
    require("../../../../src/positions/utils/getIsClosing").getIsClosing.mockReturnValue(false);
    require("../../../../src/trade/decrease/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from("20000")); // 2x
    require("../../../../src/utils/insaneMode/getUserMaxLeverage").getUserMaxLeverage.mockResolvedValue(50);
    require("../../../../src/trade/decrease/utils/getNextCollateral").getNextCollateral.mockResolvedValue(BigNumber.from("5"));
    const params = {
      account: mockAddress,
      receiveTokenInfo: { ...baseReceiveTokenInfo },
      position: { ...basePosition },
      isMarket: false,
      isKeepLeverage: false,
      chainId: mockChainId,
      decreaseAmount: "100",
      decreaseOrders: [{ sizeDelta: BigNumber.from("1000") }],
      collateralTokenInfo: { ...baseCollateralTokenInfo },
      caches: new Map(),
    };
    const errors = await validateDecreaseAmount(params as any);
    expect(errors.some((e: string) => e.includes("Leftover collateral below"))).toBe(true);
  });

  it("should return no error for valid decrease", async () => {
    require("../../../../src/positions/utils/getIsClosing").getIsClosing.mockReturnValue(false);
    require("../../../../src/trade/decrease/utils/getNextLeverage").getNextLeverage.mockResolvedValue(BigNumber.from("20000")); // 2x
    require("../../../../src/utils/insaneMode/getUserMaxLeverage").getUserMaxLeverage.mockResolvedValue(50);
    require("../../../../src/trade/decrease/utils/getNextCollateral").getNextCollateral.mockResolvedValue(BigNumber.from("1000"));
    require("../../../../src/trade/decrease/utils/getIsNeedSwap").getIsNeedSwap.mockReturnValue(false);
    const params = {
      account: mockAddress,
      receiveTokenInfo: { ...baseReceiveTokenInfo },
      position: { ...basePosition },
      isMarket: false,
      isKeepLeverage: false,
      chainId: mockChainId,
      decreaseAmount: "100",
      decreaseOrders: [{ sizeDelta: BigNumber.from("1000") }],
      collateralTokenInfo: { ...baseCollateralTokenInfo },
      caches: new Map(),
    };
    const errors = await validateDecreaseAmount(params as any);
    expect(errors.length).toBe(0);
  });
});
