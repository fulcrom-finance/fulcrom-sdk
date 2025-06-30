import { getUserMaxLeverage } from "../../../src/utils/insaneMode/getUserMaxLeverage";
import * as insaneModeModule from "../../../src/utils/insaneMode/getIsInsaneMode";
import { Address, ChainId } from "../../../src/types";

describe("getUserMaxLeverage", () => {
  const chainId =  ChainId.CRONOS_MAINNET;
  const account = "0xabc" as Address;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns MAX_LEVERAGE_INSANE when insane mode is enabled", async () => {
    jest.spyOn(insaneModeModule, "getIsInsaneModeEnabled").mockResolvedValue(true);

    const result = await getUserMaxLeverage({ chainId, account });
    expect(result).toBe(200);
  });

  it("returns MAX_LEVERAGE when insane mode is not enabled", async () => {
    jest.spyOn(insaneModeModule, "getIsInsaneModeEnabled").mockResolvedValue(false);

    const result = await getUserMaxLeverage({ chainId, account });
    expect(result).toBe(29.9);
  });
});
