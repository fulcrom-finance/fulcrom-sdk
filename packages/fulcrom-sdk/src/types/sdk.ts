import { ChainId } from "./chain";
import { Address } from "./alias";
import { OrderType } from "../trade/orders/types/orderType";
import { TokenInfo } from "./tokens";

export type CachesMap<T> = Map<string, T>;

export type ValidationParams = CreateIncreaseOrderRequest & {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  collateralTokenInfo: TokenInfo;
  caches: CachesMap<any>;
};

export enum CheckingType {
  All = "All",
  TokenApproval = "TokenApproval",
  PositionRouterApproval = "PositionRouterApproval",
  OrderBookApproval = "OrderBookApproval",
}

export type CheckingApprovalParams = {
  checkingType: CheckingType;
  account: Address;
  chainId: ChainId;
  // required if checkingType is Token
  transactionAmount?: string;
  sourceTokenSymbol?: string;
};

export type CreateIncreaseOrderRequest = {
  //Common:
  // The identifier of the blockchain network
  chainId: ChainId;
  // The address of the user's account
  account: Address;
  // The amount of the transaction
  transactionAmount: string;
  // The type of the order
  orderType: OrderType;
  // Whether it is a long position operation
  isLongPosition: boolean;
  // The source token for the transaction
  sourceTokenSymbol: string;
  // The target token for the transaction
  targetTokenSymbol: string;
  // The target price for taking profit (optional)
  takeProfitTargetPrice?: string;
  // The price that triggers the stop loss (optional)
  stopLossTriggerPrice?: string;
  // The symbol of the collateral token
  collateralTokenSymbol?: string; //long -> USDT(default), short -> USDT,USDC  (optional)

  //Position:
  // The leverage ratio used in the transaction
  leverageRatio?: number;
  // The allowed amount of slippage
  allowedSlippageAmount?: number;

  //Order:
  // The price that triggers the order execution
  triggerExecutionPrice?: string;
};

export type CreateDecreaseRequest = {
  // user wallet address
  account: Address;
  chainId: ChainId;
  // need to getPositionKey
  collateralTokenSymbol: string;
  targetTokenSymbol: string;
  isLongPosition: boolean;
  decreaseAmount: string;
  isKeepLeverage: boolean;
  // Market Close or Set TPSL
  isMarket: boolean;
  // The allowed amount of slippage and is needed when orderType is Market
  allowedSlippageAmount?: number;

  // if isMarket = false, receiveTokenSymbol will be ignored
  // if isMarket = true, default value is `position.collateralToken || 'ETH'`
  receiveTokenSymbol?: string;
  // if isMarket = false, triggerPrice is required
  triggerExecutionPrice?: string;
};

export type UpdateOrderRequest = {
  chainId: ChainId;
  account: string;
  order: {
    type: "IncreaseOrder" | "DecreaseOrder";
    id: string;
  };
  transactionAmount: string;
  triggerExecutionPrice: string;
  // The target price for taking profit (optional)
  takeProfitTargetPrice?: string;
  // The price that triggers the stop loss (optional)
  stopLossTriggerPrice?: string;
};

export type CancelOrdersRequest = {
  chainId: ChainId;
  account: string;
  orders: {
    type: "IncreaseOrder" | "DecreaseOrder";
    id: string;
  }[];
};

export type ManageCollateralRequest = {
  type: ManageCollateralType;
  account: string; // user wallet address
  chainId: number; // chainId
  // The target token for deposit or withdraw,it is the created position's token before.
  targetTokenSymbol: string;
  collateralTokenSymbol: string; //The symbol of the collateral token
  isLongPosition: boolean; //is long or short
  transactionAmount: string; // deposit or withdraw amount
  allowedSlippageAmount: number; // The allowed amount of slippage, (0.10%-1.00%) defalut 50%
};

export enum ManageCollateralType {
  DepositCollateral = "Deposit",
  WithdrawCollateral = "Withdraw",
}
