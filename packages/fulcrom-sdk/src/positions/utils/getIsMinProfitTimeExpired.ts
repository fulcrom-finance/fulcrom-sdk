import { MIN_PROFIT_TIME } from "../../config";

export const getIsMinProfitTimeExpired = (lastIncreasedTime: number) => {
  const minProfitExpiration = lastIncreasedTime + MIN_PROFIT_TIME;

  const isMinProfitTimeExpired =
    Math.floor(Date.now() / 1000) > minProfitExpiration;

  return isMinProfitTimeExpired;
};
