import { utils } from 'ethers'

import { defaultAccounts } from 'ethereum-waffle'
import { BigNumber } from '../test-utils'

const transamount = utils.parseUnits( "10", 18 );

export const DEFAULT_ACCOUNTS = defaultAccounts
export const DEFAULT_ACCOUNTS_BUIDLER = defaultAccounts.map((account) => {
  return {
    // balance: new BigNumber(account.balance).toString('hex'),
    balance: transamount.toString(),
    privateKey: account.secretKey,
  }
})

export const GAS_LIMIT = 1_000_000_000
// export const GAS_LIMIT = 12_000_000
