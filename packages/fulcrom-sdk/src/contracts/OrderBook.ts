import { OrderBook } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getOrderBook = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.OrderBook>(
    getContractAddress('OrderBook', options.chainId),
    OrderBook,
    options,
  );
};
