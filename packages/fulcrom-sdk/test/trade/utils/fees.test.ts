import { BigNumber } from "@ethersproject/bignumber";
import * as fees from "../../../src/trade/utils/fees";
import { ChainId } from "../../../src/types/chain";
import * as getFromUsdMinModule from "../../../src/trade/utils/getFromUsdMin";
import * as tradeOrderSwapFeeBpsModule from "../../../src/trade/utils/tradeOrderSwapFeeBps";
import * as marginFeeBasisPointsModule from "../../../src/query/marginFeeBasisPoints";
import * as positionModule from "../../../src/trade/utils/position";
import * as cacheModule from "../../../src/cache";

describe("fees utils", () => {
  const chainId = ChainId.CRONOS_MAINNET;
  const isLong = true;
  const fromAmount = BigNumber.from("1000000000000000000"); // 1e18
  const sizeDelta = BigNumber.from("500000000000000000"); // 0.5e18
  const fromTokenInfo = { symbol: "ETH" } as any;
  const shortCollateralTokenInfo = { symbol: "USDC" } as any;
  const toTokenInfo = { symbol: "BTC" } as any;
  let caches: Map<string, any>;

  beforeEach(() => {
    caches = new Map();
    jest.clearAllMocks();
  });

  describe("getSwapFee", () => {
    it("calculates swap fee correctly", async () => {
      jest.spyOn(getFromUsdMinModule, "getFromUsdMin").mockReturnValue(BigNumber.from(1000));
      jest.spyOn(tradeOrderSwapFeeBpsModule, "getOrderSwapFeeBps").mockResolvedValue(30); // 0.3%
      (fees as any).BASIS_POINTS_DIVISOR = 10000;

      const result = await fees.getSwapFee(
        chainId,
        isLong,
        fromAmount,
        fromTokenInfo,
        shortCollateralTokenInfo,
        toTokenInfo,
        caches
      );
      expect(result.toString()).toBe("3"); // 1000 * 30 / 10000 = 3
    });

    it("returns zero if swapFeeBps is zero", async () => {
      jest.spyOn(getFromUsdMinModule, "getFromUsdMin").mockReturnValue(BigNumber.from(1000));
      jest.spyOn(tradeOrderSwapFeeBpsModule, "getOrderSwapFeeBps").mockResolvedValue(0);
      (fees as any).BASIS_POINTS_DIVISOR = 10000;

      const result = await fees.getSwapFee(
        chainId,
        isLong,
        fromAmount,
        fromTokenInfo,
        shortCollateralTokenInfo,
        toTokenInfo,
        caches
      );
      expect(result.toString()).toBe("0");
    });
  });

  describe("getPositionFee", () => {
    it("calculates position fee correctly", async () => {
      jest.spyOn(marginFeeBasisPointsModule, "getMarginFeeBasisPoints").mockResolvedValue(20);
      jest.spyOn(positionModule, "getMarginFee").mockReturnValue(BigNumber.from(10));

      const result = await fees.getPositionFee(chainId, sizeDelta, caches);
      expect(result.toString()).toBe("10");
    });
  });

  describe("getTotalFees", () => {
    it("returns sum of swap fee and position fee as bigint", async () => {
      jest.spyOn(fees, "getSwapFee").mockResolvedValue(BigNumber.from(7));
      jest.spyOn(fees, "getPositionFee").mockResolvedValue(BigNumber.from(5));

      const result = await fees.getTotalFees(
        chainId,
        isLong,
        fromAmount,
        fromTokenInfo,
        shortCollateralTokenInfo,
        toTokenInfo,
        sizeDelta,
        caches
      );
      expect(result).toBe(BigInt(12));
    });
  });
});
