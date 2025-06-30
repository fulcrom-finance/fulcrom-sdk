import { TokenSymbol } from "../../config";
import { Address, ChainId } from "../../types";
import { validateEvmAddress } from "./validateAddress";
import { validateTargetTokenSymbol } from "./validateRequestParams";

export const validateAvailableLiquidityParams = ({
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
  const errors: string[] = [];

  // Validate chainId
  if (!Object.values(ChainId).includes(chainId)) {
    errors.push(`Invalid chainId: ${chainId}`);
    return errors;
  }

  // Validate account address format
  validateEvmAddress(account, errors);

  // Validate isLongPosition
  if (isLongPosition === undefined || typeof isLongPosition !== "boolean") {
    errors.push(
      `Invalid isLongPosition: ${isLongPosition}. Expected a boolean value (true or false).`
    );
  }

  // Validate targetTokenSymbol
  validateTargetTokenSymbol(
    targetTokenSymbol,
    "targetTokenSymbol",
    chainId,
    errors
  );

  // Validate collateralTokenSymbol
  if (!isLongPosition) {
    const validSymbols = ["USDT", "USDC"];
    if (!collateralTokenSymbol) {
      errors.push(
        `Invalid collateralTokenSymbol: Field is missing, undefined, or empty.`
      );
    } else if (!validSymbols.includes(collateralTokenSymbol)) {
      errors.push(
        `Invalid collateralTokenSymbol: ${collateralTokenSymbol}. Expected one of: ${validSymbols.join(
          ", "
        )}.`
      );
    }
  }
  return errors;
};
