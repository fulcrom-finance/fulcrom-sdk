import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { getPythNetworkUrl } from '../../../utils/getPythNetworkUrl';

export const getPythUpdateData = async (ids: string[]): Promise<string[]> => {
    const connection = new EvmPriceServiceConnection(getPythNetworkUrl());

    const priceUpdateData = await connection.getPriceFeedsUpdateData(ids);

    return priceUpdateData;
  };
