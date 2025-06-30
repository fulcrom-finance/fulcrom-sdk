import type { ContractName, TokenSymbol } from "./config";
import {
  getContractAddress,
  getTokenByAddressSafe,
  getTokenBySymbol,
} from "./config";
import type {
  Address,
  CachesMap,
  CancelOrdersRequest,
  ChainId,
  CheckingApprovalParams,
  CreateDecreaseRequest,
  CreateIncreaseOrderRequest,
  ManageCollateralRequest,
  SignerOrProvider,
  UpdateOrderRequest,
} from "./types";

import { getContract } from "./utils";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { CheckingType, ManageCollateralType } from "./types/sdk";
import { approvalChecking } from "./trade/approvalChecking";
import {
  executeIncreaseOrder,
  getAndValidateTokenInfo,
} from "./trade/orders/createIncreaseOrder";
import { TokenManager } from "./utils/tokenManager";
import { checkIsEligibleToCreateOrder } from "./trade/paramsValidation";
import { handleError } from "./common/appErrorHandler";
import {
  validateDecreaseParams,
  validateIncreaseOrderParams,
  validateUpdateOrderParams,
} from "./trade/paramsValidation/validateRequestParams";
import { getPositionList } from "./positions/getUserPositions";
import { getDecreaseOrders, getOrder, getOrders } from "./orders/getOrders";
import { getPositions } from "./positions/getPositions";
import { getOrdersWithPosition } from "./orders/getOrdersWithPosition";
import { validateChainIdAndAccount } from "./positions/validateChainIdAndAccount";
import { executeDecreaseOrder } from "./trade/orders/createDecreaseOrder";
import { getPosition } from "./positions/getPosition";
import { checkIsEligibleToCreateDecreaseOrder } from "./trade/decrease/paramsValidation/checkIsEligibleToCreateDecreaseOrder";
import { getDefaultClosePositionReceiveSymbol } from "./trade/utils/getDefaultClosePositionReceiveSymbol";
import { checkIsEligibleToUpdateOrderOrder } from "./trade/orders/update/paramsValidation/checkIsEligibleToUpdateOrderOrder";
import { executeUpdateDecreaseOrder } from "./trade/orders/updateDecreaseOrder";
import { executeUpdateIncreaseOrder } from "./trade/orders/updateIncreaseOrder";
import { OrderType } from "./query/graphql";
import { executeCancelOrder } from "./trade/orders/cancel/executeCancelOrder";
import { executeDepositCollateral } from "./trade/collateral/depositCollateral";
import { executeWithdrawCollateral } from "./trade/collateral/withdrawCollateral";
import { validateManageCollateralParams } from "./trade/collateral/validateManageCollateralParams";
import { checkIsEligibleToManageCollateral } from "./trade/collateral/validateManageCollateralParams";
import { getHistory } from "./trade/history";
import { TradingEventAction } from "./query/graphql/getTradingEvents";
import { Orders } from "./types/order";
import { validateHistoryParams } from "./trade/history/validateHistoryParams";
import { validateCancelOrderParams } from "./trade/orders/cancel/validateCancelOrderParams";
import { getMaxAvailableShort } from "./utils/getMaxAvailableShort";
import { validateAvailableLiquidityParams } from "./trade/paramsValidation/validateAvailableLiquidityParams";

export class FulcromSDK {
  private tokenManager: TokenManager;
  private caches: CachesMap<unknown>;
  constructor() {
    this.tokenManager = new TokenManager();
    this.caches = new Map();
  }

  private getContract = <T extends Contract = Contract>(
    address: string,
    abi: ContractInterface,
    chainId: ChainId,
    signerOrProvider?: SignerOrProvider
  ): T => {
    return getContract<T>(address, abi, {
      signerOrProvider,
      chainId,
    });
  };

  public getContractAddress = (
    contractName: ContractName,
    chainId: ChainId
  ) => {
    return getContractAddress(contractName, chainId);
  };

  public getTokenBySymbol = (symbol: TokenSymbol, chainId: ChainId) => {
    return this.tokenManager.getTokenBySymbol(symbol, chainId);
  };

  public getTokensInfo = async ({
    account,
    chainId,
  }: {
    account: Address;
    chainId: ChainId;
  }) => {
    return await this.tokenManager.loadTokensInfo(
      account,
      chainId,
      this.caches
    );
  };

  public getNativeTokensInfo = async ({
    account,
    chainId,
  }: {
    account: Address;
    chainId: ChainId;
  }) => {
    return await this.tokenManager.loadNativeTokensInfo(
      account,
      chainId,
      this.caches
    );
  };

  public checkApproval = async ({
    checkingType,
    account,
    chainId,
    transactionAmount,
    sourceTokenSymbol,
  }: CheckingApprovalParams) => {
    return approvalChecking({
      checkingType,
      account,
      chainId,
      transactionAmount,
      sourceTokenSymbol,
    });
  };

  public checkTradeParams = async (request: CreateIncreaseOrderRequest) => {
    try {
      const errors = validateIncreaseOrderParams(request);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          message: errors,
        };
      }

      const account = request.account;
      const chainId = request.chainId;
      const sourceTokenSymbol = request.sourceTokenSymbol;
      const targetTokenSymbol = request.targetTokenSymbol;
      const transactionAmount = request.transactionAmount;
      const isLongPosition = request.isLongPosition;
      const collateralTokenSymbol = request.collateralTokenSymbol;
      const orderType = request.orderType;
      const leverageRatio = request.leverageRatio;
      const triggerExecutionPrice = request.triggerExecutionPrice;

      const isNeedApproval = await this.checkApproval({
        checkingType: CheckingType.All,
        account,
        chainId: chainId,
        sourceTokenSymbol,
        transactionAmount,
      });
      if (isNeedApproval?.statusCode !== 200) {
        return isNeedApproval;
      }

      // get indexed tokens info
      await this.getTokensInfo({ account, chainId: chainId });
      await this.getNativeTokensInfo({ account, chainId: chainId });
      // Fetch and validate token information
      const { fromTokenInfo, toTokenInfo, collateralTokenInfo } =
        await getAndValidateTokenInfo(
          chainId,
          isLongPosition,
          {
            source: sourceTokenSymbol,
            target: targetTokenSymbol,
            collateral: collateralTokenSymbol,
          },
          this.tokenManager
        );

      const params = {
        account,
        transactionAmount,
        chainId,
        isLongPosition,
        sourceTokenSymbol,
        targetTokenSymbol,
        orderType,
        leverageRatio,
        triggerExecutionPrice,
        collateralTokenSymbol,
        fromToken: fromTokenInfo,
        toToken: toTokenInfo,
        collateralTokenInfo,
        takeProfitTargetPrice: request.takeProfitTargetPrice,
        stopLossTriggerPrice: request.stopLossTriggerPrice,
        caches: this.caches,
      };

      // check trade params
      const errorMsg = await checkIsEligibleToCreateOrder(params);

      return {
        statusCode: errorMsg.length > 0 ? 400 : 200,
        message: errorMsg,
      };
    } catch (error) {
      return handleError(error, "checking params");
    }
  };

  /**
   * Create an increase order
   */
  public createIncreaseOrder = async (request: CreateIncreaseOrderRequest) => {
    try {
      // Validate request parameters
      const checkResult = await this.checkTradeParams(request);
      if (!checkResult || checkResult.statusCode !== 200) {
        return checkResult;
      }
      // Fetch and validate token information
      const { fromTokenInfo, toTokenInfo, collateralTokenInfo } =
        await getAndValidateTokenInfo(
          request.chainId,
          request.isLongPosition,
          {
            source: request.sourceTokenSymbol,
            target: request.targetTokenSymbol,
            collateral: request.collateralTokenSymbol,
          },
          this.tokenManager
        );

      // Call executeIncreaseOrder with the prepared parameters
      return executeIncreaseOrder(
        request,
        fromTokenInfo,
        toTokenInfo,
        collateralTokenInfo,
        this.caches
      );
    } catch (error) {
      return handleError(error, "create increase order");
    }
  };

  public checkDecreaseParams = async (request: CreateDecreaseRequest) => {
    try {
      const errors = validateDecreaseParams(request);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          message: errors,
        };
      }

      const toToken = getTokenBySymbol(
        request.targetTokenSymbol as TokenSymbol,
        request.chainId
      );
      const collateralToken = getTokenBySymbol(
        request.collateralTokenSymbol as TokenSymbol,
        request.chainId
      );
      if (!toToken || !collateralToken) {
        return {
          statusCode: 400,
          message: ["Invalid token symbol"],
        };
      }

      const position = await getPosition({
        account: request.account,
        chainId: request.chainId,
        isLong: request.isLongPosition,
        toToken: toToken.address,
        collateralTokenAddress: collateralToken.address,
        caches: this.caches,
      });

      if (!position) {
        return {
          statusCode: 400,
          message: ["Position not found"],
        };
      }

      const isNeedApproval = request.isMarket
        ? await this.checkApproval({
            checkingType: CheckingType.PositionRouterApproval,
            account: request.account,
            chainId: request.chainId,
          })
        : await this.checkApproval({
            checkingType: CheckingType.OrderBookApproval,
            account: request.account,
            chainId: request.chainId,
          });
      if (isNeedApproval?.statusCode !== 200) {
        return isNeedApproval;
      }

      // set the tokenManager
      await this.getTokensInfo({
        account: request.account,
        chainId: request.chainId,
      });

      const decreaseOrders = await getDecreaseOrders(
        request.chainId,
        request.account,
        this.caches as Map<string, Orders>
      );

      // Fetch and validate token information
      const { fromTokenInfo, toTokenInfo, collateralTokenInfo } =
        await getAndValidateTokenInfo(
          request.chainId,
          request.isLongPosition,
          {
            source:
              request.isMarket && request.receiveTokenSymbol
                ? request.receiveTokenSymbol
                : getDefaultClosePositionReceiveSymbol(request.chainId),
            target: request.targetTokenSymbol,
            collateral: request.collateralTokenSymbol,
          },
          this.tokenManager
        );

      // check trade params
      const errorMsg = await checkIsEligibleToCreateDecreaseOrder({
        ...request,
        position,
        indexTokenInfo: toTokenInfo,
        collateralTokenInfo,
        receiveTokenInfo: fromTokenInfo,
        decreaseOrders,
        caches: this.caches,
      });

      return {
        statusCode: errorMsg.length > 0 ? 400 : 200,
        message: errorMsg,
      };
    } catch (error) {
      return handleError(error, "checking decrease params");
    }
  };
  /**
   * get user position list by chainId and account
   */
  public getUserPositions = async (account: Address, chainId: ChainId) => {
    try {
      // validate the parameters
      const errors = validateChainIdAndAccount(account, chainId);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          message: errors,
        };
      }

      // set the tokenManager
      await this.getTokensInfo({ account, chainId: chainId });

      const wrapPosition = await getPositionList(
        account,
        chainId,
        this.tokenManager,
        this.caches
      );

      if (wrapPosition) {
        return {
          statusCode: 200,
          message: ["get positions success"],
          data: wrapPosition,
        };
      } else {
        return {
          statusCode: 500,
          message: ["get positions failed"],
        };
      }
    } catch (error) {
      return handleError(error, "get user positions");
    }
  };

  public getOrders = async (account: Address, chainId: ChainId) => {
    // validate the parameters
    const errors = validateChainIdAndAccount(account, chainId);
    if (errors.length > 0) {
      return {
        statusCode: 400,
        message: errors,
      };
    }

    await this.getTokensInfo({ account, chainId: chainId });

    const orders = await getOrders(
      account,
      chainId,
      this.caches as Map<string, Orders>
    );
    const positions = await getPositions({
      account,
      chainId,
      caches: this.caches,
    });

    const data = await getOrdersWithPosition({
      account,
      chainId,
      tokenManager: this.tokenManager,
      orders,
      positions,
      caches: this.caches,
    });

    return {
      statusCode: 200,
      message: ["get orders success"],
      data,
    };
  };

  /**
   * Create an decrease order
   */
  public createDecreaseOrder = async (request: CreateDecreaseRequest) => {
    try {
      // validat params
      const checkResult = await this.checkDecreaseParams(request);
      if (!checkResult || checkResult.statusCode !== 200) {
        return checkResult;
      }

      // init the needed tokenInfo
      const account = request.account;
      const chainId = request.chainId;

      await this.getTokensInfo({ account, chainId: chainId });
      await this.getNativeTokensInfo({ account, chainId: chainId });
      // Fetch and validate token information
      const { toTokenInfo, collateralTokenInfo } =
        await getAndValidateTokenInfo(
          request.chainId,
          request.isLongPosition,
          {
            source: request.targetTokenSymbol,
            target: request.targetTokenSymbol,
            collateral: request.collateralTokenSymbol,
          },
          this.tokenManager
        );

      // Call executeIncreaseOrder with the prepared parameters
      return executeDecreaseOrder(
        request,
        toTokenInfo,
        collateralTokenInfo,
        this.caches
      );
    } catch (error) {
      return handleError(error, "create decrease order");
    }
  };

  public checkUpdateOrderParams = async (request: UpdateOrderRequest) => {
    try {
      const errors = validateUpdateOrderParams(request);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          message: errors,
        };
      }

      const order = await getOrder({
        account: request.account,
        chainId: request.chainId,
        orderType: request.order.type as OrderType,
        orderId: request.order.id,
        caches: this.caches as Map<string, Orders>,
      });
      if (!order) {
        return {
          statusCode: 400,
          message: ["Order not found"],
        };
      }

      const position = await getPosition({
        account: request.account,
        chainId: request.chainId,
        isLong: order.isLong,
        toToken: order.indexToken,
        collateralTokenAddress: order.collateralToken,
        caches: this.caches,
      });
      // set the tokenManager
      await this.getTokensInfo({
        account: request.account,
        chainId: request.chainId,
      });
      // Fetch and validate token information
      const { fromTokenInfo, toTokenInfo, collateralTokenInfo } =
        await getAndValidateTokenInfo(
          request.chainId,
          order.isLong,
          {
            source:
              order.type === "IncreaseOrder"
                ? (getTokenByAddressSafe(order.purchaseToken, request.chainId)
                    ?.symbol as TokenSymbol)
                : getDefaultClosePositionReceiveSymbol(request.chainId),
            target: getTokenByAddressSafe(order.indexToken, request.chainId)
              ?.symbol as TokenSymbol,
            collateral: getTokenByAddressSafe(
              order.collateralToken,
              request.chainId
            )?.symbol,
          },
          this.tokenManager
        );

      // check trade params
      const errorMsg = await checkIsEligibleToUpdateOrderOrder({
        ...request,
        order,
        position,
        purchaseTokenInfo: fromTokenInfo,
        indexTokenInfo: toTokenInfo,
        collateralTokenInfo,
        caches: this.caches,
      });

      return {
        statusCode: errorMsg.length > 0 ? 400 : 200,
        message: errorMsg,
      };
    } catch (error) {
      return handleError(error, "checking decrease params");
    }
  };

  public updateOrder = async (request: UpdateOrderRequest) => {
    try {
      const checkResult = await this.checkUpdateOrderParams(request);
      if (!checkResult || checkResult.statusCode !== 200) {
        return checkResult;
      }
      if (request.order.type == "DecreaseOrder") {
        return executeUpdateDecreaseOrder(request, this.caches);
      } else if (request.order.type == "IncreaseOrder") {
        return executeUpdateIncreaseOrder(request, this.caches);
      }
    } catch (error) {
      return handleError(error, "checking update order params");
    }
  };

  public cancelOrders = async (request: CancelOrdersRequest) => {
    try {
      // Validate request parameters
      const errors = validateCancelOrderParams(request);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          message: errors,
        };
      }

      const orders = await getOrders(
        request.account,
        request.chainId,
        this.caches as Map<string, Orders>
      );

      if (!orders) {
        return {
          statusCode: 400,
          message: ["Orders not found"],
        };
      }

      const cancelOrders = orders.tradeOrders.filter((order) =>
        request.orders.find(
          (item) => item.type === order.type && item.id === order.id
        )
      );

      if (cancelOrders.length === 0) {
        return {
          statusCode: 400,
          message: ["No orders to cancel"],
        };
      }

      // Call executeIncreaseOrder with the prepared parameters
      const txData = await executeCancelOrder(request, cancelOrders);

      return {
        statusCode: 200,
        message: [
          cancelOrders.length < request.orders.length
            ? `cancel ${cancelOrders.length} order(s) success, ${
                request.orders.length - cancelOrders.length
              } order(s) not found`
            : "cancel orders success",
        ],
        txData: [txData],
      };
    } catch (error) {
      return handleError(error, "cancel orders");
    }
  };

  public checkManageCollateralParams = async (
    request: ManageCollateralRequest
  ) => {
    try {
      const errors = validateManageCollateralParams(request);
      if (errors.length > 0) {
        return {
          statusCode: 400,
          message: errors,
        };
      }

      const toToken = getTokenBySymbol(
        request.targetTokenSymbol as TokenSymbol,
        request.chainId
      );
      const collateralToken = getTokenBySymbol(
        request.collateralTokenSymbol as TokenSymbol,
        request.chainId
      );
      if (!toToken || !collateralToken) {
        return {
          statusCode: 400,
          message: ["Invalid token symbol"],
        };
      }

      const position = await getPosition({
        account: request.account,
        chainId: request.chainId,
        isLong: request.isLongPosition,
        toToken: toToken.address,
        collateralTokenAddress: collateralToken.address,
        caches: this.caches,
      });

      if (!position) {
        return {
          statusCode: 400,
          message: ["Position not found"],
        };
      }

      // the sourceToken is the position.collateralToken
      const sourceTokenSymbol = getTokenByAddressSafe(
        position.collateralToken,
        request.chainId
      )?.symbol;
      // check if need position router approval
      const isNeedPositionRouterApproval = await this.checkApproval({
        checkingType: CheckingType.PositionRouterApproval,
        account: request.account,
        chainId: request.chainId,
        transactionAmount: request.transactionAmount,
        sourceTokenSymbol: sourceTokenSymbol,
      });
      if (isNeedPositionRouterApproval?.statusCode !== 200) {
        return isNeedPositionRouterApproval;
      }

      //check if need token approval
      const isNeedTokenApproval = await this.checkApproval({
        checkingType: CheckingType.TokenApproval,
        account: request.account,
        chainId: request.chainId,
        transactionAmount: request.transactionAmount,
        sourceTokenSymbol: sourceTokenSymbol,
      });

      if (isNeedTokenApproval?.statusCode !== 200) {
        return isNeedTokenApproval;
      }

      // set the tokenManager
      await this.getTokensInfo({
        account: request.account,
        chainId: request.chainId,
      });
      // check manage collateral params
      const errorMsg = await checkIsEligibleToManageCollateral(
        request,
        position,
        this.tokenManager,
        this.caches
      );

      return {
        statusCode: errorMsg.length > 0 ? 400 : 200,
        message: errorMsg,
      };
    } catch (error) {
      return handleError(error, "checking manage collateral params");
    }
  };

  public manageCollateral = async (request: ManageCollateralRequest) => {
    try {
      const checkResult = await this.checkManageCollateralParams(request);
      if (!checkResult || checkResult.statusCode !== 200) {
        return checkResult;
      }

      // Fetch and validate token information
      const { toTokenInfo, collateralTokenInfo } =
        await getAndValidateTokenInfo(
          request.chainId,
          request.isLongPosition,
          {
            source:
              request.targetTokenSymbol ??
              getDefaultClosePositionReceiveSymbol(request.chainId),
            target: request.targetTokenSymbol,
            collateral: request.collateralTokenSymbol,
          },
          this.tokenManager
        );

      if (request.type == ManageCollateralType.DepositCollateral) {
        return executeDepositCollateral(
          request,
          toTokenInfo,
          collateralTokenInfo,
          this.caches
        );
      } else if (request.type == ManageCollateralType.WithdrawCollateral) {
        return executeWithdrawCollateral(
          request,
          toTokenInfo,
          collateralTokenInfo,
          this.caches
        );
      }
    } catch (error) {
      return handleError(error, "manage collateral");
    }
  };

  public getTradeHistory = async ({
    account,
    chainId,
    filters,
    pagination = {
      page: 1,
      limit: 20,
    },
  }: {
    account: Address;
    chainId: ChainId;
    filters: TradingEventAction[];
    pagination: {
      // pagination params
      page: number; // Page number (default: 1)
      limit: number; // Items per page (default: 20)
    };
  }) => {
    try {
      // Validate request parameters
      const errors = validateHistoryParams({
        account,
        chainId,
        filters,
        pagination,
      });

      if (errors.length > 0) {
        return {
          statusCode: 400,
          message: errors,
        };
      }

      const history = await getHistory({
        account,
        chainId,
        filters,
        pagination,
      });
      return {
        statusCode: 200,
        message: ["get trade history success"],
        data: history,
      };
    } catch (error) {
      return handleError(error, "get trade history");
    }
  };
  public getAvailableLiquidity = async ({
    account,
    chainId,
    isLongPosition,
    targetTokenSymbol,
    collateralTokenSymbol,
  }: {
    account: Address;
    chainId: ChainId;
    isLongPosition: boolean;
    targetTokenSymbol: TokenSymbol;
    collateralTokenSymbol?: TokenSymbol;
  }) => {
    const errors = validateAvailableLiquidityParams({
      account,
      chainId,
      isLongPosition,
      targetTokenSymbol,
      collateralTokenSymbol,
    });
    if (errors.length > 0) {
      return {
        statusCode: 400,
        message: errors,
      };
    }
    // set the tokenManager
    await this.getTokensInfo({
      account: account,
      chainId: chainId,
    });
    // Fetch and validate token information
    const { toTokenInfo, collateralTokenInfo } = await getAndValidateTokenInfo(
      chainId,
      isLongPosition,
      {
        source: targetTokenSymbol,
        target: targetTokenSymbol,
        collateral: collateralTokenSymbol,
      },
      this.tokenManager
    );

    const maxAvailableShort = getMaxAvailableShort(
      toTokenInfo,
      collateralTokenInfo
    );

    return {
      statusCode: 200,
      message: ["get available liquidity success"],
      data: {
        maxAvailable: isLongPosition
          ? toTokenInfo.maxAvailableLong
          : maxAvailableShort,
        maxCapacity: isLongPosition
          ? toTokenInfo.maxLongCapacity
          : toTokenInfo.globalShortSize.add(maxAvailableShort),
        currentSize: isLongPosition
          ? toTokenInfo.guaranteedUsd
          : toTokenInfo.globalShortSize,
      },
    };
  };
}
