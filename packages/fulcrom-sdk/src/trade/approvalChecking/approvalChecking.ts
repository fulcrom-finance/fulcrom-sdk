import appLogger from "../../common/appLogger";
import {
  getContractAddress,
  getTokenBySymbol,
  getTokenBySymbolSafe,
  TokenSymbol,
} from "../../config";
import { approveTokenTxData } from "../../query/erc20/approveTokenTxData";
import { approvePluginTxData } from "../../query/positions/approvePluginTxData";
import { CheckingApprovalParams } from "../../types";
import { validateApprovalCheckingRequest } from "../paramsValidation/validateRequestParams";
import { checkIsNeedOrderBookApproval } from "./checkIsNeedOrderBookApproval";
import { checkIsNeedTokenApproval } from "./checkIsNeedTokenApproval";
import { checkIsNeedPositionRouterApproval } from "./IsNeedPositionRouterApproval";

export const approvalChecking = async (request: CheckingApprovalParams) => {
  const errors = validateApprovalCheckingRequest(request);
  if (errors.length > 0) {
    return {
      statusCode: 400,
      message: [`Validation error:${errors}`],
    };
  }
  const checkingType = request.checkingType;
  const account = request.account;
  const chainId = request.chainId;
  const transactionAmount = request.transactionAmount;
  const sourceTokenSymbol = request.sourceTokenSymbol;

  if (checkingType === "TokenApproval") {
    const token = getTokenBySymbol(sourceTokenSymbol as TokenSymbol, chainId);
    // check approval
    const isNeedTokenApproval = await checkIsNeedTokenApproval({
      account,
      chainId,
      transactionAmount: transactionAmount as string,
      sourceTokenSymbol: sourceTokenSymbol as string,
    });
    if (isNeedTokenApproval) {
      const txData = await approveTokenTxData(
        account,
        chainId,
        token,
        getContractAddress("Router", chainId)
      );

      return {
        statusCode: 400,
        message: [`Token ${sourceTokenSymbol} needs approval`],
        txData: [txData],
      };
    }
    return {
      statusCode: 200,
      message: [],
      txData: [],
    };
  }
  if (checkingType === "PositionRouterApproval") {
    // check positionRouter approval
    const isNeedApproval = await checkIsNeedPositionRouterApproval({
      account,
      chainId,
    });
    if (isNeedApproval) {
      const txData = await approvePluginTxData({
        account,
        chainId,
        plugin: getContractAddress("PositionRouter", chainId),
      });
      return {
        statusCode: 400,
        message: ["PositionRouter needs approval"],
        txData: [txData],
      };
    }
    return {
      statusCode: 200,
      message: [],
      txData: [],
    };
  }
  if (checkingType === "OrderBookApproval") {
    // check orderBook approval
    const isNeedApproval = await checkIsNeedOrderBookApproval({
      account,
      chainId,
    });
    if (isNeedApproval) {
      const txData = await approvePluginTxData({
        account,
        chainId,
        plugin: getContractAddress("OrderBook", chainId),
      });
      return {
        statusCode: 400,
        message: ["OrderBook needs approval"],
        txData: [txData],
      };
    }
    return {
      statusCode: 200,
      message: [],
      txData: [],
    };
  }
  if (checkingType === "All") {
    // check all approval
    const token = getTokenBySymbolSafe(
      sourceTokenSymbol as TokenSymbol,
      chainId
    );
    if (!sourceTokenSymbol || !token || !transactionAmount) {
      return;
    }
    try {
      const settled = await Promise.allSettled([
        checkIsNeedTokenApproval({
          account,
          chainId,
          transactionAmount,
          sourceTokenSymbol,
        }),
        checkIsNeedPositionRouterApproval({
          account,
          chainId,
        }),
        checkIsNeedOrderBookApproval({
          account,
          chainId,
        }),
      ]);
      const [
        isNeedTokenApproval,
        isNeedPositionRouterApproval,
        isNeedOrderBookApproval,
      ] = settled.map((v) => {
        if (v.status === "fulfilled") {
          return v.value;
        } else {
          throw new Error(v.reason, {
            cause: v.reason,
          });
        }
      });
      if (
        !isNeedTokenApproval &&
        !isNeedPositionRouterApproval &&
        !isNeedOrderBookApproval
      ) {
        return {
          statusCode: 200,
          message: [],
          txData: [],
        };
      }

      const approvals = [];
      const message = [];
      if (isNeedTokenApproval) {
        approvals.push(
          approveTokenTxData(
            account,
            chainId,
            token,
            getContractAddress("Router", chainId)
          )
        );
        message.push(`Token ${sourceTokenSymbol} needs approval`);
      }
      if (isNeedPositionRouterApproval) {
        approvals.push(
          approvePluginTxData({
            account,
            chainId,
            plugin: getContractAddress("PositionRouter", chainId),
          })
        );
        message.push("PositionRouter needs approval");
      }
      if (isNeedOrderBookApproval) {
        approvals.push(
          approvePluginTxData({
            account,
            chainId,
            plugin: getContractAddress("OrderBook", chainId),
          })
        );
        message.push("OrderBook needs approval");
      }
      const txData = await Promise.allSettled(approvals);
      const txDataFiltered = txData.map((v) => {
        if (v.status === "fulfilled") {
          return v.value;
        } else {
          appLogger.info(`reason: ${v.reason}`);
          throw new Error(v.reason, {
            cause: v.reason,
          });
        }
      });
      return {
        statusCode: 400,
        message: message,
        txData: txDataFiltered,
      };
    } catch (error) {
      if (error instanceof Error) {
        appLogger.error(`Error checking approvals: ${error.message}`);
        return {
          statusCode: 400,
          message: [error.message ?? "Internal server error"],
        };
      } else {
        appLogger.error(`Error checking approvals: Unknown error`);
        return {
          statusCode: 500,
          message: ["Internal server error"],
        };
      }
    }
  }
};
