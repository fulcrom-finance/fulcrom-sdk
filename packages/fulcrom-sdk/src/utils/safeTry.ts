import appLogger from "../common/appLogger";

/**
 * expected that the function could throw error, safely handle it
 */
export const safeTry = async <D, Prom = Promise<D>>(prom: () => Prom) => {
  try {
    const data = await prom();

    return data;
  } catch (e) {
    appLogger.info("[safeTry]", e);
  }
};
