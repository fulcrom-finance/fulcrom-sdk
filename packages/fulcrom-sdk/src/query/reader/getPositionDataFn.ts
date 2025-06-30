import { getContractAddress, getIndexTokens } from "../../config";
import { getReaderV2 } from "../../contracts/ReaderV2";
import { getPositionKey } from "../../positions/getPositionKey";
import { Address, ChainId } from "../../types";
import { BigNumber } from "@ethersproject/bignumber";
import { BigIntPosition, RawPosition } from "../../types/position";

export const getPositionDataFn = async (account: Address, chainId: ChainId) => {
  const vaultAddress = getContractAddress("Vault", chainId);
  const { collateralTokens, indexTokens, isLongs } = getPositionsQuery(chainId);

  const readerV2 = getReaderV2({ chainId });

  const positionData = await readerV2.getPositions(
    vaultAddress,
    account,
    collateralTokens,
    indexTokens,
    isLongs
  );

  return toBigIntPositions({
    account,
    collateralTokens,
    indexTokens,
    isLongs,
    positionData,
  });
};

const propsLength = 9;

export const toBigIntPositions = ({
  account,
  collateralTokens,
  indexTokens,
  isLongs,
  positionData,
}: {
  account: string;
  collateralTokens: Address[];
  indexTokens: Address[];
  isLongs: boolean[];
  positionData: BigNumber[];
}) => {
  const transformed: BigIntPosition[] = collateralTokens
    .map((_, i) => {
      const collateralToken = collateralTokens[i];
      const indexToken = indexTokens[i];
      // skip this position, if size is zero

      const key = getPositionKey({
        account,
        collateralTokenAddress: collateralToken,
        toToken: indexToken,
        isLong: isLongs[i],
      });

      return {
        size: positionData[i * propsLength].toBigInt(),
        key: key,
        isLong: isLongs[i],
        collateralToken: collateralToken,
        indexToken: indexTokens[i],
        collateral: positionData[i * propsLength + 1].toBigInt(),
        averagePrice: positionData[i * propsLength + 2].toBigInt(),
        entryFundingRate: positionData[i * propsLength + 3].toBigInt(),
        hasRealisedProfit: positionData[i * propsLength + 4].toNumber() === 1,
        realisedPnl: positionData[i * propsLength + 5].toBigInt(),
        lastIncreasedTime: positionData[i * propsLength + 6].toNumber(),
        hasProfit: positionData[i * propsLength + 7].toNumber() === 1,
        delta: positionData[i * propsLength + 8].toBigInt(),
      };
    })
    // skip this position, if size is zero
    .filter((p) => p.size > BigInt(0));

  return transformed;
};

/**
 * positions are identified with the combination of:
 * (account, index token address, index token address, isLong)
 */
export const getPositionsQuery = (chainId: ChainId) => {
  const indexTokens = [];
  const collateralTokens = [];
  const isLongs = [];
  const tokens = [...getIndexTokens(chainId)];

  // find out all the possible long position keys
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // can't Long stable coins
    if (token.isStable) continue;

    // for Long position, the index token and the collateral token must be the same
    collateralTokens.push(token.address);
    indexTokens.push(token.address);
    isLongs.push(true);
  }

  // find out all the possible short position keys
  for (let i = 0; i < tokens.length; i++) {
    const stableToken = tokens[i];
    if (!stableToken.isStable) continue;

    for (let j = 0; j < tokens.length; j++) {
      const token = tokens[j];
      // short token can't be stable coin
      if (token.isStable) continue;

      // short collateral token must be a stable token
      collateralTokens.push(stableToken.address);
      indexTokens.push(token.address);
      isLongs.push(false);
    }
  }

  return { collateralTokens, indexTokens, isLongs };
};

export const toRawPosition = (positions: BigIntPosition[]): RawPosition[] => {
  return positions.map((p) => ({
    ...p,
    size: BigNumber.from(p.size),
    collateral: BigNumber.from(p.collateral),
    averagePrice: BigNumber.from(p.averagePrice),
    entryFundingRate: BigNumber.from(p.entryFundingRate),
    realisedPnl: BigNumber.from(p.realisedPnl),
    delta: BigNumber.from(p.delta),
  }));
};
