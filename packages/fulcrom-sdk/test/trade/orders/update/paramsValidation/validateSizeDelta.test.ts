jest.mock("../../../../../src/orders/validateOrder", () => ({
  validateIncreaseOrder: jest.fn(),
}));

import { BigNumber } from "@ethersproject/bignumber";
import { validateSizeDelta } from "../../../../../src/trade/orders/update/paramsValidation/validateSizeDelta";
import * as leverageUtils from "../../../../../src/trade/orders/update/utils/getLeverages";
import * as insaneModeUtils from "../../../../../src/utils/insaneMode/getUserMaxLeverage";
import * as orderErrorUtils from "../../../../../src/orders/getOrderErrorFromValidationResult";
import { validateIncreaseOrder } from "../../../../../src/orders/validateOrder";

describe("validateSizeDelta", () => {
  const baseOrder = {
    // Minimal IncreaseOrder mock
    id: "1",
    sizeDelta: "1000",
    isLong: true,
    // ...other required IncreaseOrder fields
  } as any;

  const basePosition = {
    isLong: true,
    averagePrice: BigNumber.from(150),
    size: BigNumber.from(1000),
    liqPrice: BigNumber.from(120),
  } as any;

  const baseTokenInfo = {
    maxPrice: BigNumber.from(200),
    minPrice: BigNumber.from(100),
  } as any;

  const baseParams = {
    order: baseOrder,
    account: "0xabc",
    chainId: 25,
    position: basePosition,
    purchaseTokenInfo: baseTokenInfo,
    transactionAmount: "100",
    indexTokenInfo: baseTokenInfo,
    collateralTokenInfo: baseTokenInfo,
    caches: new Map(),
    triggerExecutionPrice: "150", // required param
  };

jest.mock("../../../../../src/orders/validateOrder", () => ({
  ...jest.requireActual("../../../../../src/orders/validateOrder"),
  validateIncreaseOrder: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (validateIncreaseOrder as jest.Mock).mockReset();
});

it("returns [] for valid input", async () => {
  jest.spyOn(leverageUtils, "getLeverages").mockResolvedValue({ current: BigInt("0"), next: BigInt("10000") });
  jest.spyOn(insaneModeUtils, "getUserMaxLeverage").mockResolvedValue(2); // maxLeverage = 2 * 10000 = 20000
  (validateIncreaseOrder as jest.Mock).mockReturnValue({} as any);
  jest.spyOn(orderErrorUtils, "getOrderErrorFromValidationResult").mockReturnValue(undefined);

  const result = await validateSizeDelta(baseParams);
  expect(result).toEqual([]);
});

it("returns error if next leverage exceeds max", async () => {
  jest.spyOn(leverageUtils, "getLeverages").mockResolvedValue({ current: BigInt("0"), next: BigInt("30000") });
  jest.spyOn(insaneModeUtils, "getUserMaxLeverage").mockResolvedValue(2); // maxLeverage = 20000
  (validateIncreaseOrder as jest.Mock).mockReturnValue({} as any);
  jest.spyOn(orderErrorUtils, "getOrderErrorFromValidationResult").mockReturnValue(undefined);

  const result = await validateSizeDelta(baseParams);
  expect(result[0]).toMatch(/Exceeded the max allowed leverage/);
});

it("returns error if next leverage is zero or negative", async () => {
  jest.spyOn(leverageUtils, "getLeverages").mockResolvedValue({ current: BigInt("0"), next: BigInt("0") });
  jest.spyOn(insaneModeUtils, "getUserMaxLeverage").mockResolvedValue(2);
  (validateIncreaseOrder as jest.Mock).mockReturnValue({} as any);
  jest.spyOn(orderErrorUtils, "getOrderErrorFromValidationResult").mockReturnValue(undefined);

  const result = await validateSizeDelta(baseParams);
  expect(result[0]).toMatch(/Exceeded the max allowed leverage/);
});

it("returns error from getOrderErrorFromValidationResult", async () => {
  jest.spyOn(leverageUtils, "getLeverages").mockResolvedValue({ current: BigInt("0"), next: BigInt("10000") });
  jest.spyOn(insaneModeUtils, "getUserMaxLeverage").mockResolvedValue(2);
  (validateIncreaseOrder as jest.Mock).mockReturnValue({} as any);
  jest.spyOn(orderErrorUtils, "getOrderErrorFromValidationResult").mockReturnValue("Some order error");

  const result = await validateSizeDelta(baseParams);
  expect(result).toContain("Some order error");
});
});
