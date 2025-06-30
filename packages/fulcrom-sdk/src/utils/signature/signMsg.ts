import type { providers } from "ethers";
import { ethers } from "ethers";
import { hexlify, toUtf8Bytes } from "ethers/lib/utils";

export const signMsg = async (
  provider: providers.JsonRpcProvider,
  msg: string
) => {
  const signer = provider.getSigner();
  const signerAddress = (await signer).getAddress();
  const signature: string = await provider.send("personal_sign", [
    hexlify(toUtf8Bytes(msg)),
    signerAddress,
  ]);

  return {
    signerAddress,
    signature: normalizeSignature(signature),
  };
};

/**
 * some hardware cold wallet can generate signatures that are not verifiable on BE side
 * normalizing by split and join can solve the problem
 * https://docs.ethers.io/v5/api/utils/bytes/#byte-manipulation--signature-conversion
 */
const normalizeSignature = (signature: string) =>
  ethers.utils.joinSignature(ethers.utils.splitSignature(signature));
