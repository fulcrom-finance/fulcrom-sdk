export const getPythNetworkUrl = () => {
  if (!process.env.PYTH_NETWORK) {
    throw new Error("PYTH_NETWORK environment variable is not set");
  }
  return process.env.PYTH_NETWORK;
};
