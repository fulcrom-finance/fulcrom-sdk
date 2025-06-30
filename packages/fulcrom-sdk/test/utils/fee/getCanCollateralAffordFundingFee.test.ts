import { BigNumber } from '@ethersproject/bignumber';
import { getCanCollateralAffordFundingFee, getCollateralThreshold } from '../../../src/utils/fee/getCanCollateralAffordFundingFee';

describe('getCanCollateralAffordFundingFee', () => {
  const baseParams = {
    swapFee: BigNumber.from('100'),
    marginFee: BigNumber.from('200'),
    poolAmount: BigNumber.from('1000'),
    reservedAmount: BigNumber.from('800'),
    fundingFee: BigNumber.from('300'),
    depositFee: BigNumber.from('50'),
  };

  it('returns true when collateral is greater than threshold', () => {
    const threshold = getCollateralThreshold(baseParams);
    const params = {
      ...baseParams,
      collateral: threshold.add(1),
    };
    expect(getCanCollateralAffordFundingFee(params)).toBe(true);
  });

  it('returns false when collateral is equal to threshold', () => {
    const threshold = getCollateralThreshold(baseParams);
    const params = {
      ...baseParams,
      collateral: threshold,
    };
    expect(getCanCollateralAffordFundingFee(params)).toBe(false);
  });

  it('returns false when collateral is less than threshold', () => {
    const threshold = getCollateralThreshold(baseParams);
    const params = {
      ...baseParams,
      collateral: threshold.sub(1),
    };
    expect(getCanCollateralAffordFundingFee(params)).toBe(false);
  });

  it('handles zero poolAmount and reservedAmount', () => {
    const params = {
      swapFee: BigNumber.from('10'),
      marginFee: BigNumber.from('20'),
      poolAmount: BigNumber.from('0'),
      reservedAmount: BigNumber.from('0'),
      fundingFee: BigNumber.from('30'),
      depositFee: BigNumber.from('5'),
      collateral: BigNumber.from('100'),
    };
    expect(getCanCollateralAffordFundingFee(params)).toBe(true);
  });

  it('handles poolAmount less than reservedAmount', () => {
    const params = {
      swapFee: BigNumber.from('10'),
      marginFee: BigNumber.from('20'),
      poolAmount: BigNumber.from('150'),
      reservedAmount: BigNumber.from('100'),
      fundingFee: BigNumber.from('30'),
      depositFee: BigNumber.from('5'),
      collateral: BigNumber.from('100'),
    };
    expect(getCanCollateralAffordFundingFee(params)).toBe(true);
  });
});
