import { BasicTokenInfo } from "../../types";

export type NativeTokenInfo = Omit<BasicTokenInfo, "balance">;
