import { getIsInsaneModeEnabled } from "../../../src/utils/insaneMode/getIsInsaneMode";
import * as getDepositBalancesModule from "../../../src/utils/getDepositBalances";
import { INSANE_FLP_THRESHOLD } from "../../../src/config";
import { BigNumber } from "@ethersproject/bignumber";
import { ChainId } from "../../../src/types/chain";

jest.mock("../../../src/utils/getDepositBalances");

describe("getIsInsaneModeEnabled", () => {
  const chainId = ChainId.CRONOS_MAINNET;
  const account = "0xabc";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when stakedFlpFormatted >= INSANE_FLP_THRESHOLD", async () => {
    // 1.5x threshold
    const stakedFlp = BigNumber.from("3150000000000000000000"); // 150 ETH 
    (getDepositBalancesModule.queryDepositBalances as jest.Mock).mockResolvedValue({
      flpInStakedFlp: stakedFlp,
    });

    const result = await getIsInsaneModeEnabled({ chainId, account });
    expect(result).toBe(true);
  });

  it("returns false when stakedFlpFormatted < INSANE_FLP_THRESHOLD", async () => {
    // 0.5x threshold
    const stakedFlp = BigNumber.from("50000000000000000000"); // 50 ETH
    (getDepositBalancesModule.queryDepositBalances as jest.Mock).mockResolvedValue({
      flpInStakedFlp: stakedFlp,
    });

    const result = await getIsInsaneModeEnabled({ chainId, account });
    expect(result).toBe(false);
  });

  it("returns false when stakedFlp is undefined", async () => {
    (getDepositBalancesModule.queryDepositBalances as jest.Mock).mockResolvedValue({
      flpInStakedFlp: undefined,
    });

    const result = await getIsInsaneModeEnabled({ chainId, account });
    expect(result).toBe(false);
  });

  it("returns false when queryDepositBalances returns null", async () => {
    (getDepositBalancesModule.queryDepositBalances as jest.Mock).mockResolvedValue(null);

    const result = await getIsInsaneModeEnabled({ chainId, account });
    expect(result).toBe(false);
  });
});
