import { expect } from './setup'

/* External Imports */
import { ethers } from '@nomiclabs/buidler'
import { readArtifact } from '@nomiclabs/buidler/plugins'

import { Contract, ContractFactory, Signer, BigNumber, utils, providers } from 'ethers'
import {
  getContractFactory, sleep, sendLT, getBalanceLT, ContractDeployOptions, deployContract, linkBytecode
} from './test-utils'

import { getLogger } from './test-utils'

import { GAS_LIMIT } from './test-helpers'
import { Artifact } from '@nomiclabs/buidler/types'

const log = getLogger('Phisable-Test')

function getRandomNumberBetween( min:number , max:number ){

  return Math.floor( Math.random() * (max-min+1) + min );
}

describe('HodiFraud Unint Pointer Test', () => {
  let wallet: Signer
  let usr1: Signer
  let usr2: Signer
  let usr3: Signer

  before(async () => {
    ;[wallet, usr1, usr2, usr3] = await ethers.getSigners()

    log.info(`Admin :: ${await wallet.getAddress()}`)
    log.info(`Usr1 :: ${await usr1.getAddress()}`)
    log.info(`Usr2 :: ${await usr2.getAddress()}`)
    log.info(`Usr3 :: ${await usr3.getAddress()}`)
  })

  let hodifraudfact: ContractFactory
  let hodifraudinst: Contract
  before(async () => {

    hodifraudfact = getContractFactory( "HodlFraud", wallet )

    log.debug( `Network Gas price @ ${await ethers.provider.getGasPrice()}`)

    log.debug(`S1-Ent wallet bal :: ${ethers.utils.formatUnits(await wallet.getBalance(), "ether")}`)

    const transamount = ethers.utils.parseUnits( "1.5", 18 );

    // Deploy the contract
    let deploycfg: ContractDeployOptions = {
      factory: hodifraudfact,
      params: [],
      signer: wallet
    }

    hodifraudinst = await deployContract( deploycfg, transamount )

    log.debug( `HodiFraud @ ${hodifraudinst.address}`)

    const bal = await hodifraudinst.provider.getBalance( hodifraudinst.address )

    log.debug(`HodiFraud balance :: ${ethers.utils.formatUnits( bal , "ether" )}`)

    log.debug(`S1-Ext wallet bal :: ${ethers.utils.formatUnits(await wallet.getBalance(), "ether")}`)

  })


  it("tst-item-001-run-attack", async () => {

    try {

      log.debug(`S2-Ent :: ${ethers.utils.formatUnits( await wallet.getBalance(), "ether")}`)

      log.debug(`S2-Ent usr1 bal :: ${ethers.utils.formatUnits( await usr1.getBalance(), "ether")}`)

      log.debug(`S2 b4 withdraw :: ${ethers.utils.formatUnits(await hodifraudinst.ownerAmount())}`)

      const transamount = ethers.utils.parseUnits( "0.3", 18 )

      const payInCalldata = hodifraudinst.interface.encodeFunctionData(
        'payIn',
        [3]
      )

      let nonce = await usr1.provider.getTransactionCount(await usr1.getAddress())

      log.debug(`S2.1 nounce :: ${nonce}`)

      await usr1.provider.call({
        nonce,
        gasLimit: GAS_LIMIT,
        gasPrice: 0,
        to: hodifraudinst.address,
        value: transamount,
        data: payInCalldata,
      })

      await sleep( 5000 )

      const withdrawCalldata = hodifraudinst.interface.encodeFunctionData(
        'withdraw',
        []
      )

      nonce = await usr1.provider.getTransactionCount(await usr1.getAddress())

      log.debug(`S2.2 nounce :: ${nonce}`)

      await usr1.provider.call({
        nonce,
        gasLimit: GAS_LIMIT,
        gasPrice: 0,
        to: hodifraudinst.address,
        value: transamount,
        data: payInCalldata,
      })

      log.debug(`S2 aft withdraw :: ${ethers.utils.formatUnits(await hodifraudinst.ownerAmount())}`)

      log.debug(`S2-Ext usr1 bal :: ${ethers.utils.formatUnits( await usr1.getBalance(), "ether")}`)

      log.debug(`S2-Ext :: ${ethers.utils.formatUnits( await wallet.getBalance(), "ether")}`)
    }
    catch( err ){

      log.error(`Exception Err ${err}`)

    }
  })

  afterEach("Test-Case End Contract Status", async () => {

    let bal = await hodifraudinst.provider.getBalance( hodifraudinst.address );

    log.debug(`HodiFraud balance :: ${ethers.utils.formatUnits( bal , "ether" )}`)

    log.debug(`S3-Ext wallet bal :: ${ethers.utils.formatUnits(await wallet.getBalance(), "ether")}`)

  })

  after("Test Done Cleanup", async () => {

    // await phishableattackinst.closeContract( await wallet.getAddress() )

    let bal = await hodifraudinst.provider.getBalance( hodifraudinst.address );

    log.debug(`HodiFraud balance :: ${ethers.utils.formatUnits( bal , "ether" )}`)

    log.debug(`S4-Ext wallet bal :: ${ethers.utils.formatUnits(await wallet.getBalance(), "ether")}`)

  })

})
