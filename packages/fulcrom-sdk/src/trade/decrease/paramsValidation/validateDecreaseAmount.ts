import {
  BASIS_POINTS_DIVISOR,
  expandDecimals,
  MIN_COLLATERAL,
  MIN_LEVERAGE,
  MIN_POSITION_USD,
  ONE_USD,
  USD_DECIMALS,
  USDG_DECIMALS,
} from "../../../config";
import { getIsClosing } from "../../../positions/utils/getIsClosing";
import { DecreaseOrder } from "../../../query/graphql";
import { Address, ChainId, TokenInfo } from "../../../types";
import { Position } from "../../../types/position";
import { getUserMaxLeverage } from "../../../utils/insaneMode/getUserMaxLeverage";
import { formatAmountUsd } from "../../../utils/numbers/formatAmountUsd";
import { parseValue } from "../../../utils/numbers/parseValue";
import { getIsNeedSwap } from "../utils/getIsNeedSwap";
import { getNextCollateral } from "../utils/getNextCollateral";
import { getNextLeverage } from "../utils/getNextLeverage";
import { getReceiveAmount, getReceiveUsd } from "../utils/getReceiveAmount";

export const validateDecreaseAmount = async (params: {
  account: Address;
  receiveTokenInfo: TokenInfo;
  position: Position;
  isMarket: boolean;
  isKeepLeverage: boolean;
  chainId: ChainId;
  triggerExecutionPrice?: string;
  decreaseAmount: string;
  decreaseOrders: DecreaseOrder[];
  collateralTokenInfo: TokenInfo;
  caches: Map<string, any>;
}) => {
  const {
    account,
    receiveTokenInfo,
    position,
    isMarket,
    isKeepLeverage,
    chainId,
    triggerExecutionPrice,
    decreaseAmount,
    decreaseOrders,
    collateralTokenInfo,
  } = params;
  const errorMsg = [];

  const fromUsd = parseValue(params.decreaseAmount, USD_DECIMALS);
  if (fromUsd.gt(params.position.size))
    errorMsg.push("This exceeds your current max position");

  if (fromUsd.gt(params.decreaseOrders[0].sizeDelta))
    errorMsg.push("This exceeds your current max order size");

  const isNeedSwap = getIsNeedSwap({
    isMarket: params.isMarket,
    collateralToken: params.collateralTokenInfo,
    receiveToken: params.receiveTokenInfo,
  });

  const receiveUsd = await getReceiveUsd({
    chainId,
    isMarket,
    position,
    isKeepLeverage,
    triggerPrice: triggerExecutionPrice,
    decreaseAmount,
    decreaseOrders,
    caches: params.caches,
  });

  const receiveAmount = await getReceiveAmount({
    chainId,
    receiveTokenInfo,
    isMarket,
    position,
    isKeepLeverage,
    triggerPrice: triggerExecutionPrice,
    decreaseAmount,
    decreaseOrders,
    receiveUsd,
    caches: params.caches,
  });
  /**
   * When swap collateralToken for receiveToken
   * the pool changes: receiveToken decreases, collateralToken increases.
   * we need to ensure that:
   *   1. the receiveToken pool have enough liquidity for the swap
   *   2. the collateralToken pool liquidity doesn't exceed the maxUsdgAmount after the swap
   */
  if (isNeedSwap) {
    const isNotEnoughReceiveTokenLiquidity =
      receiveTokenInfo.availableAmount.lt(receiveAmount) ||
      receiveTokenInfo.bufferAmount.gt(
        receiveTokenInfo.poolAmount.sub(receiveAmount)
      );

    if (isNotEnoughReceiveTokenLiquidity)
      errorMsg.push("Insufficient receive token liquidity");

    const receiveUsdg = receiveUsd
      .mul(expandDecimals(USDG_DECIMALS))
      .div(ONE_USD);
    const nextUsdgAmount = collateralTokenInfo.usdgAmount.add(receiveUsdg);

    const isCollateralPoolCapacityExceeded = nextUsdgAmount.gt(
      collateralTokenInfo.maxUsdgAmount
    );

    if (isCollateralPoolCapacityExceeded)
      errorMsg.push(`${collateralTokenInfo.symbol} pool exceeded`);
  }

  const isClosing = getIsClosing(decreaseAmount, position);

  if (!isClosing) {
    const nextLeverage = await getNextLeverage({
      chainId,
      isMarket,
      position,
      isKeepLeverage,
      triggerPrice: triggerExecutionPrice,
      decreaseAmount,
      decreaseOrders,
      caches: params.caches,
    });

    const maxLeverage = await getUserMaxLeverage({
      account,
      chainId,
    });
    const nextSize = position.size.sub(fromUsd);
    const nextCollateral = await getNextCollateral({
      chainId,
      isMarket,
      position,
      isKeepLeverage,
      triggerPrice: triggerExecutionPrice,
      decreaseAmount,
      decreaseOrders,
      isClosing,
      caches: params.caches,
    });

    if (!isKeepLeverage && nextLeverage.lt(MIN_LEVERAGE * BASIS_POINTS_DIVISOR))
      errorMsg.push(
        `Min leverage ${MIN_LEVERAGE}x. Lower your amount or increase your position with higher leverage.`
      );

    if (!isKeepLeverage && nextLeverage.gt(maxLeverage * BASIS_POINTS_DIVISOR))
      errorMsg.push(
        `Max leverage ${maxLeverage}x. Lower your withdraw amount or decrease your position.`
      );

    if (nextSize.lt(MIN_POSITION_USD))
      errorMsg.push(
        `Leftover size below ${formatAmountUsd(MIN_POSITION_USD, {
          displayDecimals: 0,
        })} USD`
      );

    if (nextCollateral.lt(MIN_COLLATERAL))
      errorMsg.push(
        `Leftover collateral below ${formatAmountUsd(MIN_COLLATERAL, {
          displayDecimals: 0,
        })} USD`
      );
  }

  return errorMsg;
};
