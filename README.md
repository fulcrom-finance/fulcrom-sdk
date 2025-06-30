# Fulcrom SDK

Welcome to the Fulcrom SDK! This package provides tools and utilities to streamline development within the Fulcrom ecosystem.

## Features

- **Easy Integration**: Simplify the process of integrating Fulcrom APIs into your projects.
- **Utilities**: A collection of helper functions to enhance productivity.
- **Customizable**: Tailor the SDK to fit your specific needs.

## Installation

Install the package using npm:

```bash
npm install fulcrom-sdk
```

Or using pnpm:

```bash
pnpm add fulcrom-sdk
```

## Usage

Import the SDK into your project:

```javascript
import { Address, ChainId, FulcromSDK } from "@fulcrom-finance/fulcrom-sdk";

// Example usage
const orders = await fulcromSDK.getOrders(account as Address, chainId as ChainId);

```

### Methods

#### Trade

##### **checkTradeParams**

Verify whether the parameters for creating and increasing orders are valid.

```typescript
const result = await fulcromSDK.checkTradeParams(request);
```

- **Params**

| Key                   | Type                     | Description                                                         |
| --------------------- | ------------------------ | ------------------------------------------------------------------- |
| account               | `Address`                | The user's wallet address.                                          |
| chainId               | `ChainId`                | The blockchain network ID.                                          |
| sourceTokenSymbol     | `TokenSymbol`            | The symbol of the source token.                                     |
| targetTokenSymbol     | `TokenSymbol`            | The symbol of the target token.                                     |
| transactionAmount     | `string`                 | The amount of the transaction.                                      |
| isLongPosition        | `boolean`                | Indicates whether the position is long.                             |
| collateralTokenSymbol | `TokenSymbol` (optional) | The symbol of the collateral token.                                 |
| orderType             | `OrderType`              | The type of the order (e.g., `Market`, `Limit` or `StopMarket`).    |
| leverageRatio         | `string` (optional)      | The leverage ratio for the trade.                                   |
| allowedSlippageAmount | `number` (optional)      | the allowed amount of slippage                                      |
| triggerExecutionPrice | `string` (optional)      | The price at which the order should be executed (for limit orders). |
| takeProfitTargetPrice | `string` (optional)      | The target price for taking profit.                                 |
| stopLossTriggerPrice  | `string` (optional)      | The price at which the stop-loss order should be triggered.         |

- **Return**

| Key        | Type       | Description                                                                 |
| ---------- | ---------- | --------------------------------------------------------------------------- |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors).          |
| message    | `string[]` | An array of error messages if validation fails, or an empty array if valid. |
| txData     | `object[]` | if need approval, will return transaction info.                             |

##### **createIncreaseOrder**

Create an order.

```typescript
const result = await fulcromSDK.createIncreaseOrder(request);
```

- **Params**

| Key                   | Type                     | Description                                                         |
| --------------------- | ------------------------ | ------------------------------------------------------------------- |
| account               | `Address`                | The user's wallet address.                                          |
| chainId               | `ChainId`                | The blockchain network ID.                                          |
| sourceTokenSymbol     | `TokenSymbol`            | The symbol of the source token.                                     |
| targetTokenSymbol     | `TokenSymbol`            | The symbol of the target token.                                     |
| transactionAmount     | `string`                 | The amount of the transaction.                                      |
| isLongPosition        | `boolean`                | Indicates whether the position is long.                             |
| collateralTokenSymbol | `TokenSymbol` (optional) | The symbol of the collateral token.                                 |
| orderType             | `OrderType`              | The type of the order (e.g., `Market`, `Limit` or `StopMarket`).    |
| leverageRatio         | `string`                 | The leverage ratio for the trade.                                   |
| allowedSlippageAmount | `number` (optional)      | the allowed amount of slippage                                      |
| triggerExecutionPrice | `string` (optional)      | The price at which the order should be executed (for limit orders). |
| takeProfitTargetPrice | `string` (optional)      | The target price for taking profit.                                 |
| stopLossTriggerPrice  | `string` (optional)      | The price at which the stop-loss order should be triggered.         |

- **Return**

| Key        | Type       | Description                                                                 |
| ---------- | ---------- | --------------------------------------------------------------------------- |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors).          |
| message    | `string[]` | An array of error messages if validation fails, or an empty array if valid. |
| txData     | `object[]` | The details of the created order, including transaction info.               |

##### **checkDecreaseParams**

Verify whether the parameters for creating reduced orders are valid.

```typescript
const result = await fulcromSDK.checkDecreaseParams(request);
```

- **Params**

| Key                   | Type                | Description                                                         |
| --------------------- | ------------------- | ------------------------------------------------------------------- |
| account               | `Address`           | The user's wallet address.                                          |
| chainId               | `ChainId`           | The blockchain network ID.                                          |
| collateralTokenSymbol | `TokenSymbol`       | The symbol of the collateral token.                                 |
| targetTokenSymbol     | `TokenSymbol`       | The symbol of the target token.                                     |
| isLongPosition        | `boolean`           | Indicates whether the position is long.                             |
| decreaseAmount        | `string`            | The amount to decrease from the position.                           |
| isKeepLeverage        | `boolean`           | Indicates if leverage should be kept                                |
| isMarket              | `boolean`           | Indicates if the decrease is a market position                      |
| allowedSlippageAmount | `number` (optional) | the allowed amount of slippage                                      |
| receiveTokenSymbol    | `string` (optional) | Token symbol to receive after decreasing the position               |
| triggerExecutionPrice | `string` (optional) | The price at which the order should be executed (for limit orders). |

- **Return**

| Key        | Type       | Description                                                                 |
| ---------- | ---------- | --------------------------------------------------------------------------- |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors).          |
| message    | `string[]` | An array of error messages if validation fails, or an empty array if valid. |
| txData     | `object[]` | if need approval, will return transaction info.                             |

##### **createDecreaseOrder**

Create a decrease order.

```typescript
const result = await fulcromSDK.createDecreaseOrder(request);
```

- **Params**

| Key                   | Type                | Description                                                         |
| --------------------- | ------------------- | ------------------------------------------------------------------- |
| account               | `Address`           | The user's wallet address.                                          |
| chainId               | `ChainId`           | The blockchain network ID.                                          |
| collateralTokenSymbol | `TokenSymbol`       | The symbol of the collateral token.                                 |
| targetTokenSymbol     | `TokenSymbol`       | The symbol of the target token.                                     |
| isLongPosition        | `boolean`           | Indicates whether the position is long.                             |
| decreaseAmount        | `string`            | The amount to decrease from the position.                           |
| isKeepLeverage        | `boolean`           | Indicates if leverage should be kept                                |
| isMarket              | `boolean`           | Indicates if the decrease is a market position                      |
| allowedSlippageAmount | `number` (optional) | the allowed amount of slippage                                      |
| receiveTokenSymbol    | `string` (optional) | Token symbol to receive after decreasing the position               |
| triggerExecutionPrice | `string` (optional) | The price at which the order should be executed (for limit orders). |

- **Return**

| Key        | Type       | Description                                                                 |
| ---------- | ---------- | --------------------------------------------------------------------------- |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors).          |
| message    | `string[]` | An array of error messages if validation fails, or an empty array if valid. |
| txData     | `object[]` | The details of the created order, including transaction info.               |

##### **getAvailableLiquidity**

Get the max available liquidity

```typescript
const positions = await fulcromSDK.getAvailableLiquidity({
  account,
  chainId,
  isLongPosition,
  targetTokenSymbol,
  collateralTokenSymbol,
});
```

- **Params**

| Key                   | Type                    | Description                                                                                            |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| account               | `Address`               | The user's wallet address.                                                                             |
| chainId               | `ChainId`               | The blockchain network ID.                                                                             |
| isLongPosition        | `boolean`               | Indicates whether the position is long.                                                                |
| targetTokenSymbol     | `string`                | Target token symbol.                                                                                   |
| collateralTokenSymbol | `TokenSymbol`(optional) | The symbol of the collateral token (e.g., USDT, USDC). If `isLongPosition` is false, this is required. |

- **Return**

| Key        | Type       | Description                                                                                                                                                                                                                                   |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors).                                                                                                                                                                            |
| message    | `string[]` | A message indicating the result of the operation.                                                                                                                                                                                             |
| data       | `object`   | this data contains `maxAvailable`(max available liquidity amount as a string (BigNumber)), `maxCapacity`(maximum capacity for the target token as a string (BigNumber)), `currentSize`(current size of the position as a string (BigNumber)). |

#### Position

##### **getUserPositions**

Get the user's position list.

```typescript
const positions = await fulcromSDK.getUserPositions(
  account as Address,
  chainId as ChainId
);
```

- **Params**

| Key     | Type      | Description                |
| ------- | --------- | -------------------------- |
| account | `Address` | The user's wallet address. |
| chainId | `ChainId` | The blockchain network ID. |

- **Return**

| Key        | Type       | Description                                                               |
| ---------- | ---------- | ------------------------------------------------------------------------- |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors).        |
| message    | `string[]` | A message indicating the result of the operation.                         |
| data       | `object[]` | An array of position objects, each containing details about the position. |

#### Order

##### **getOrders**

Get the user's order list.

```typescript
const orders = await fulcromSDK.getOrders(
  account as Address,
  chainId as ChainId
);
```

- **Params**

| Key     | Type      | Description                |
| ------- | --------- | -------------------------- |
| account | `Address` | The user's wallet address. |
| chainId | `ChainId` | The blockchain network ID. |

- **Return**

| Key        | Type       | Description                                                                 |
| ---------- | ---------- | --------------------------------------------------------------------------- |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors).          |
| message    | `string[]` | A message indicating the result of the operation.                           |
| data       | `object[]` | An array of order objects, each containing details about the user's orders. |

##### **checkUpdateOrderParams**

Verify that the parameters for updating an order are valid.

```typescript
const result = await fulcromSDK.checkUpdateOrderParams(request);
```

- **Params**

| Key                   | Type                | Description                                                                            |
| --------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| account               | `Address`           | The user's wallet address.                                                             |
| chainId               | `ChainId`           | The blockchain network ID.                                                             |
| order                 | `object`            | The id and the type (e.g., `IncreaseOrder` or `DecreaseOrder`) of the order to update. |
| transactionAmount     | `string`            | The new transaction amount for the order.                                              |
| triggerExecutionPrice | `string`            | The new price at which the order should be executed.                                   |
| takeProfitTargetPrice | `string` (optional) | The new target price for taking profit.                                                |
| stopLossTriggerPrice  | `string` (optional) | The new price at which the stop-loss order should be triggered.                        |

- **Return**

| Key        | Type       | Description                                                        |
| ---------- | ---------- | ------------------------------------------------------------------ |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors). |
| message    | `string[]` | A message indicating the result of the operation.                  |
| txData     | `object[]` | The details of the updated order, including transaction info.      |

##### **updateOrder**

Update the order.

```typescript
const result = await fulcromSDK.updateOrder(request);
```

- **Params**

| Key                   | Type                | Description                                                                            |
| --------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| account               | `Address`           | The user's wallet address.                                                             |
| chainId               | `ChainId`           | The blockchain network ID.                                                             |
| order                 | `object`            | The id and the type (e.g., `IncreaseOrder` or `DecreaseOrder`) of the order to update. |
| transactionAmount     | `string`            | The new transaction amount for the order.                                              |
| triggerExecutionPrice | `string`            | The new price at which the order should be executed.                                   |
| takeProfitTargetPrice | `string` (optional) | The new target price for taking profit.                                                |
| stopLossTriggerPrice  | `string` (optional) | The new price at which the stop-loss order should be triggered.                        |

- **Return**

| Key        | Type       | Description                                                        |
| ---------- | ---------- | ------------------------------------------------------------------ |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors). |
| message    | `string[]` | A message indicating the result of the operation.                  |
| txData     | `object[]` | The details of the updated order, including transaction info.      |

##### **cancelOrders**

Cancel orders, supports batch cancellation of orders.

```typescript
const result = await fulcromSDK.cancelOrders(request);
```

- **Params**

| Key     | Type       | Description                                                                                          |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| account | `Address`  | The user's wallet address.                                                                           |
| chainId | `ChainId`  | The blockchain network ID.                                                                           |
| orders  | `object[]` | An array of orders with id and order type (e.g., `IncreaseOrder` or `DecreaseOrder`) to be canceled. |

- **Return**

| Key        | Type       | Description                                                        |
| ---------- | ---------- | ------------------------------------------------------------------ |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors). |
| message    | `string[]` | A message indicating the result of the operation.                  |
| txData     | `object`   | Details about the canceled orders.                                 |

#### Collateral

##### **checkManageCollateralParams**

Verify whether the parameters for managing collateral are valid.

```typescript
const result = await fulcromSDK.checkManageCollateralParams(request);
```

- **Params**

| Key                   | Type          | Description                                                   |
| --------------------- | ------------- | ------------------------------------------------------------- |
| account               | `Address`     | The user's wallet address.                                    |
| chainId               | `ChainId`     | The blockchain network ID.                                    |
| type                  | `string`      | Type of collateral management (e.g., `Deposit` or `Withdraw`) |
| targetTokenSymbol     | `string`      | Target token symbol.                                          |
| collateralTokenSymbol | `TokenSymbol` | The symbol of the collateral token.                           |
| isLongPosition        | `boolean`     | Indicates whether the position is long.                       |
| transactionAmount     | `string`      | The amount of the transaction.                                |
| allowedSlippageAmount | `number`      | the allowed amount of slippage                                |

- **Return**

| Key        | Type       | Description                                                                 |
| ---------- | ---------- | --------------------------------------------------------------------------- |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors).          |
| message    | `string[]` | An array of error messages if validation fails, or an empty array if valid. |
| txData     | `object[]` | `txData[]` if approval is required, `[]` otherwise.                         |

##### **manageCollateral**

Manage collateral (deposit or withdraw).

```typescript
const result = await fulcromSDK.manageCollateral(request);
```

- **Params**

| Key                   | Type          | Description                                                   |
| --------------------- | ------------- | ------------------------------------------------------------- |
| account               | `Address`     | The user's wallet address.                                    |
| chainId               | `ChainId`     | The blockchain network ID.                                    |
| type                  | `string`      | Type of collateral management (e.g., `Deposit` or `Withdraw`) |
| targetTokenSymbol     | `string`      | Target token symbol.                                          |
| collateralTokenSymbol | `TokenSymbol` | The symbol of the collateral token.                           |
| isLongPosition        | `boolean`     | Indicates whether the position is long.                       |
| transactionAmount     | `string`      | The amount of the transaction.                                |
| allowedSlippageAmount | `number`      | the allowed amount of slippage                                |

- **Return**

| Key        | Type       | Description                                                        |
| ---------- | ---------- | ------------------------------------------------------------------ |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors). |
| message    | `string[]` | A message indicating the result of the operation.                  |
| txData     | `object[]` | Details about the updated collateral.                              |

#### History

##### **getTradeHistory**

Get the user's transaction history.

```typescript
const history = await fulcromSDK.getTradeHistory({
  account: account as Address,
  chainId: chainId as ChainId,
  filters: [TradingEventAction.ActionType],
  pagination: { page: 1, limit: 20 },
});
```

- **Params**

| Key        | Type                              | Description                                                                                                             |
| ---------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| account    | `Address`                         | The user's wallet address.                                                                                              |
| chainId    | `ChainId`                         | The blockchain network ID.                                                                                              |
| filters    | `TradingEventAction[]` (optional) | An array of filters to narrow down the trade history (e.g., `CreateIncreasePosition`, `ExecuteIncreasePosition`, ect.). |
| pagination | `object` (optional)               | Pagination options, including `page` (number) and `limit` (number).                                                     |

- **Return**

| Key        | Type       | Description                                                               |
| ---------- | ---------- | ------------------------------------------------------------------------- |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors).        |
| message    | `string[]` | A message indicating the result of the operation.                         |
| data       | `object[]` | An array of trade history objects, each containing details about a trade. |

#### Utilities

##### **checkApproval**

Check if approval is required.

```typescript
const approvalStatus = await fulcromSDK.checkApproval({
  checkingType: CheckingType.All,
  account,
  chainId,
  transactionAmount,
  sourceTokenSymbol,
});
```

- **Params**

| Key               | Type                     | Description                                                                                                 |
| ----------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| checkingType      | `CheckingType`           | The type of approval check (e.g., `All`, `TokenApproval`, `PositionRouterApproval` or `OrderBookApproval`). |
| account           | `Address`                | The user's wallet address.                                                                                  |
| chainId           | `ChainId`                | The blockchain network ID.                                                                                  |
| transactionAmount | `string` (optional)      | The amount of the transaction, it is requiredif checkingType is `TokenApproval`.                            |
| sourceTokenSymbol | `TokenSymbol` (optional) | The symbol of the source token, it is required if checkingType is `TokenApproval`.                          |

- **Return**

| Key        | Type       | Description                                                        |
| ---------- | ---------- | ------------------------------------------------------------------ |
| statusCode | `number`   | The HTTP status code (200 for success, 400 for validation errors). |
| message    | `string[]` | A message indicating the result of the operation.                  |
| txData     | `object[]` | `txData[]` if approval is required, `[]` otherwise.                |

## Env

```plaintext
// the RPC URL
FULCROM_SDK_RPC_URL=xxxxxxxxxxxxxx
// the PYTH URL
PYTH_NETWORK=xxxxxxxxxxxxxx
// the sub-graphQL endpoint
FULCROM_SDK_GRAPHQL_ENDPOINT=xxxxxxxxxxxxxx
// the URI of trades
FULCROM_SDK_TRADES_GRAPHQL_URI=xxxxxxxxxxxxxx
// the candle price graphQL endpoint
FULCROM_SDK_PUBLIC_CANDLE_ENDPOINT=xxxxxxxxxxxxxx
```

## Contributing

We welcome contributions! Please follow our [contribution guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to reach out with any questions or feedback!
