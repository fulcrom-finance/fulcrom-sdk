import { isIndexToken } from "../../config";
import {
  TradingEvent as GraphqlTradingEvent,
  TradingEventAction,
} from "../../query/graphql/getTradingEvents";
import { ChainId } from "../../types";
import {
  isCancelSwapOrder,
  isCreateDecreasePositionEvent,
  isCreateOrUpdateDecreaseTradeOrderEvent,
  isCreateSwapEvent,
  isDecreasePositionEvent,
  isExecuteDecreasePositionEvent,
  isExecuteDecreaseTradeOrderEvent,
  isExecuteIncreasePositionEvent,
  isExecuteSwapOrderEvent,
  isExecuteTradeOrderEvent,
  isIncreasePositionEvent,
  isIncreaseTradeOrderEvent,
  isLiquidatePositionEvent,
  isPartialLiquidationEvent,
  isSwapEvent,
  isSwapOrderEvent,
  isTradeOrderEvent,
  isUpdateSwapOrder,
  TradingEvent,
} from "../../types/tradeEventChecking";
import { parseValue } from "../../utils/numbers/parseValue";

export const formattedTradingEvents = <A extends TradingEventAction>(
  rawTradingEvents: GraphqlTradingEvent<A>[],
  chainId: ChainId
): TradingEvent<A>[] => {
  return rawTradingEvents
    .map((event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let paramsParsed: Record<string, any> | undefined;

      try {
        paramsParsed = JSON.parse(event.params);
        // eslint-disable-next-line no-empty
      } catch (_) {}

      const tradingEvent = {
        ...event,
        paramsParsed,
      } as TradingEvent<A>;

      if (!paramsParsed) {
        return tradingEvent;
      }

      if (isIncreasePositionEvent(tradingEvent)) {
        /**
         * Note: since the current `tradingEvent.paramsParsed.acceptablePrice` is not the actual `acceptablePrice` of the event,
         * and I think it's risky to change that now, that's why we have `originalAcceptablePrice`
         */
        const originalAcceptablePrice = paramsParsed.acceptablePrice;

        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          // FIXME: ask Alson for clarification
          acceptablePrice: parseValue(
            isExecuteIncreasePositionEvent(tradingEvent)
              ? paramsParsed.executionPrice
              : paramsParsed.acceptablePrice,
            0
          ),
          amountIn: parseValue(paramsParsed.amountIn, 0),
          executionFee: parseValue(paramsParsed.executionFee, 0),
          sizeDelta: parseValue(paramsParsed.sizeDelta, 0),
          tp: parseValue(paramsParsed.tp, 0),
          sl: parseValue(paramsParsed.sl, 0),
          tpSlExecutionFee: parseValue(paramsParsed.tpSlExecutionFee, 0),
        };

        if (tradingEvent.action === TradingEventAction.CreateIncreasePosition) {
          tradingEvent.paramsParsed = {
            ...tradingEvent.paramsParsed,
            prevSize: parseValue(paramsParsed.prevSize, 0),
            prevCollateral: parseValue(paramsParsed.prevCollateral, 0),
          };
        } else if (
          tradingEvent.action === TradingEventAction.ExecuteIncreasePosition
        ) {
          tradingEvent.paramsParsed = {
            ...tradingEvent.paramsParsed,
            size: parseValue(paramsParsed.size, 0),
            collateral: parseValue(paramsParsed.collateral, 0),
            reserveAmount: parseValue(paramsParsed.reserveAmount, 0),
            // `ExecuteIncreasePosition` only has `realisedPnl`
            realisedPnl: parseValue(paramsParsed.realisedPnl, 0),
            averagePrice: parseValue(paramsParsed.averagePrice, 0),
            markPrice: parseValue(paramsParsed.markPrice, 0),
            collateralDelta: parseValue(paramsParsed.collateralDelta, 0),
            marginFee: parseValue(paramsParsed.marginFee, 0),
            price: parseValue(paramsParsed.price, 0),
            originalAcceptablePrice: parseValue(originalAcceptablePrice, 0),
            executionPrice: parseValue(paramsParsed.executionPrice, 0),
            maxLeverage: parseValue(paramsParsed.maxLeverage, 0),
            fixedLiquidationFeeUsd: parseValue(
              paramsParsed.fixedLiquidationFeeUsd,
              0
            ),
            prevCollateral: parseValue(paramsParsed.prevCollateral, 0),
          };
        }
      }

      if (isDecreasePositionEvent(tradingEvent)) {
        /**
         * Note: since the current `tradingEvent.paramsParsed.acceptablePrice` is not the actual `acceptablePrice` of the event,
         * and I think it's risky to change that now, that's why we have `originalAcceptablePrice`
         */
        const originalAcceptablePrice = paramsParsed.acceptablePrice;

        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          acceptablePrice: parseValue(
            isExecuteDecreasePositionEvent(tradingEvent)
              ? paramsParsed.executionPrice
              : paramsParsed.acceptablePrice,
            0
          ),
          collateralDelta: parseValue(paramsParsed.collateralDelta, 0),
          executionFee: parseValue(paramsParsed.executionFee, 0),
          sizeDelta: parseValue(paramsParsed.sizeDelta, 0),
        };

        if (isCreateDecreasePositionEvent(tradingEvent)) {
          tradingEvent.paramsParsed = {
            ...tradingEvent.paramsParsed,
            prevSize: parseValue(paramsParsed.prevSize, 0),
            prevCollateral: parseValue(paramsParsed.prevCollateral, 0),
          };
        } else if (isExecuteDecreasePositionEvent(tradingEvent)) {
          tradingEvent.paramsParsed = {
            ...tradingEvent.paramsParsed,
            size: parseValue(paramsParsed.size, 0),
            collateral: parseValue(paramsParsed.collateral, 0),
            realizedPnl: parseValue(paramsParsed.realizedPnl, 0),
            markPrice: parseValue(paramsParsed.markPrice, 0),
            originalAcceptablePrice: parseValue(originalAcceptablePrice, 0),
            executionPrice: parseValue(paramsParsed.executionPrice, 0),
            maxLeverage: parseValue(paramsParsed.maxLeverage, 0),
            fixedLiquidationFeeUsd: parseValue(
              paramsParsed.fixedLiquidationFeeUsd,
              0
            ),
            averagePrice: parseValue(paramsParsed.averagePrice, 0),
            prevCollateral: parseValue(paramsParsed.prevCollateral, 0),
            collectMarginFeeInUsd: parseValue(
              paramsParsed.collectMarginFeeInUsd,
              0
            ),
          };

          if (paramsParsed.collectSwapFeeInUsd !== undefined) {
            tradingEvent.paramsParsed.collectSwapFeeInUsd = parseValue(
              paramsParsed.collectSwapFeeInUsd,
              0
            );
          }
        }
      }

      if (isTradeOrderEvent(tradingEvent)) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          executionFee: parseValue(paramsParsed.executionFee, 0),
          sizeDelta: parseValue(paramsParsed.sizeDelta, 0),
          triggerPrice: parseValue(paramsParsed.triggerPrice, 0),
        };
        if (isIncreaseTradeOrderEvent(tradingEvent)) {
          tradingEvent.paramsParsed = {
            ...tradingEvent.paramsParsed,
            tp: parseValue(paramsParsed.tp, 0),
            sl: parseValue(paramsParsed.sl, 0),
            tpSlExecutionFee: parseValue(paramsParsed.tpSlExecutionFee, 0),
          };
        }
      }
      if (isCreateOrUpdateDecreaseTradeOrderEvent(tradingEvent)) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          prevSize: parseValue(paramsParsed.prevSize, 0),
          prevCollateral: parseValue(paramsParsed.prevCollateral, 0),
          collateralDelta: parseValue(paramsParsed.collateralDelta, 0), // will throw error til Aaron deploy fix
        };
      }

      if (isExecuteTradeOrderEvent(tradingEvent)) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          executionPrice: parseValue(paramsParsed.executionPrice, 0),
          size: parseValue(paramsParsed.size, 0),
          collateral: parseValue(paramsParsed.collateral, 0),
          collateralDelta: parseValue(paramsParsed.collateralDelta, 0),
          markPrice: parseValue(paramsParsed.markPrice, 0),
          averagePrice: parseValue(paramsParsed.averagePrice, 0),
          prevCollateral: parseValue(paramsParsed.prevCollateral, 0),
        };
      }

      if (isExecuteDecreaseTradeOrderEvent(tradingEvent)) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          realizedPnl: parseValue(paramsParsed.realizedPnl, 0),
          collectMarginFeeInUsd: parseValue(
            paramsParsed.collectMarginFeeInUsd,
            0
          ),
        };

        if (paramsParsed.collectSwapFeeInUsd !== undefined) {
          tradingEvent.paramsParsed.collectSwapFeeInUsd = parseValue(
            paramsParsed.collectSwapFeeInUsd,
            0
          );
        }
      }

      if (isSwapOrderEvent(tradingEvent)) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          amountIn: parseValue(paramsParsed.amountIn, 0),
          executionFee: parseValue(paramsParsed.executionFee, 0),
          minOut: parseValue(paramsParsed.minOut, 0),
          triggerRatio: parseValue(paramsParsed.triggerRatio, 0),
        };
      }

      if (isExecuteSwapOrderEvent(tradingEvent)) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          amountOut: parseValue(paramsParsed.amountOut, 0),
        };
      }

      if (isSwapEvent(tradingEvent)) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          amountIn: parseValue(paramsParsed.amountIn, 0),
          amountOut: parseValue(paramsParsed.amountOut, 0),
        };
      }

      if (
        isCreateSwapEvent(tradingEvent) ||
        isUpdateSwapOrder(tradingEvent) ||
        isCancelSwapOrder(tradingEvent)
      ) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          amountIn: parseValue(paramsParsed.amountIn, 0),
          triggerRatio: parseValue(paramsParsed.triggerRatio, 0),
          minOut: parseValue(paramsParsed.minOut, 0),
        };
      }

      if (isLiquidatePositionEvent(tradingEvent)) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          markPrice: parseValue(paramsParsed.markPrice, 0),
          size: parseValue(paramsParsed.size, 0),
          collateral: parseValue(paramsParsed.collateral, 0),
          liquidationFee: parseValue(paramsParsed.liquidationFee, 0),
          collectMarginFeeInUsd: parseValue(
            paramsParsed.collectMarginFeeInUsd,
            0
          ),
        };
      }

      if (isPartialLiquidationEvent(tradingEvent)) {
        tradingEvent.paramsParsed = {
          ...tradingEvent.paramsParsed,
          markPrice: parseValue(paramsParsed.markPrice, 0),
          size: parseValue(paramsParsed.size, 0),
          collateral: parseValue(paramsParsed.collateral, 0),
          leftTokenAmount: parseValue(paramsParsed.leftTokenAmount, 0),
        };
      }

      return tradingEvent;
    })
    .filter((v) => {
      // failed to parse paramsParsed
      if (!v.paramsParsed) return false;
      if (isIncreasePositionEvent(v) || isDecreasePositionEvent(v)) {
        const { indexToken, path } = v.paramsParsed;

        return [indexToken]
          .concat((path || []).filter((v) => !!v))
          .filter((v) => !!v)
          .every((v) => isIndexToken(v, chainId));
      }

      if (isSwapEvent(v)) {
        const { tokenIn, tokenOut } = v.paramsParsed;

        return [tokenIn, tokenOut].every((v) => isIndexToken(v, chainId));
      }

      if (isTradeOrderEvent(v)) {
        const { collateralToken, indexToken, purchaseToken } = v.paramsParsed;

        if (purchaseToken && !isIndexToken(purchaseToken, chainId)) {
          return false;
        }

        return [collateralToken, indexToken].every((v) =>
          isIndexToken(v, chainId)
        );
      }

      if (isSwapOrderEvent(v)) {
        const { path } = v.paramsParsed;

        return path.filter((v) => !!v).every((v) => isIndexToken(v, chainId));
      }

      if (isLiquidatePositionEvent(v) || isPartialLiquidationEvent(v)) {
        const { indexToken, collateralToken } = v.paramsParsed;

        return [indexToken, collateralToken].every((v) =>
          isIndexToken(v, chainId)
        );
      }

      return false;
    });
};
