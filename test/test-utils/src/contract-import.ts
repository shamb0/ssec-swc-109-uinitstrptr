import * as path from 'path'

import { ethers } from '@nomiclabs/buidler'
import { Artifact } from '@nomiclabs/buidler/types'

import { Contract, ContractFactory, Signer, BigNumberish, providers } from 'ethers'

import { Interface } from 'ethers/lib/utils'
import { ContractDeployOptions } from "../intf/gdefs"

import { getLogger } from "./log"

const log = getLogger('contract-import')

export const getContractDefinition = (name: string): any => {
  return require(path.join(__dirname, '../../../artifacts', `${name}.json`))
}

export const getContractInterface = (name: string): Interface => {
  const definition = getContractDefinition(name)
  return new ethers.utils.Interface(definition.abi)
}

export const getContractFactory = (
  name: string,
  signer?: Signer
): ContractFactory => {
  const definition = getContractDefinition(name)
  const contractInterface = getContractInterface(name)
  return new ContractFactory(contractInterface, definition.bytecode, signer)
}


export const linkBytecode = async (artifact: Artifact, libraries: any ): Promise<string> => {

  let bytecode = artifact.bytecode;

  for (const [fileName, fileReferences] of Object.entries(
    artifact.linkReferences
  )) {
    for (const [libName, fixups] of Object.entries(fileReferences)) {

      const addr = libraries[libName];

      if (addr === undefined) {
        continue;
      }

      for (const fixup of fixups) {
        bytecode =
          bytecode.substr(0, 2 + fixup.start * 2) +
          addr.substr(2) +
          bytecode.substr(2 + (fixup.start + fixup.length) * 2);
      }
    }
  }

  return bytecode;

}

/**
 * Deploys a single contract.
 * @param config Contract deployment configuration.
 * @return Deployed contract.
 */
export const deployContract = async (
  config: ContractDeployOptions,
  initEthValue?: BigNumberish
): Promise<Contract> => {
  config.factory = config.factory.connect(config.signer)
  const rawTx = config.factory.getDeployTransaction(...config.params)

  // Can't use this because it fails on ExecutionManager & FraudVerifier
  // return config.factory.deploy(...config.params)

  const deployResult = await config.signer.sendTransaction({
    data: rawTx.data,
    gasLimit: 9_500_000,
    gasPrice: 2_000_000_000,
    value: initEthValue,
    nonce: await config.signer.getTransactionCount('pending'),
  })

  const receipt: providers.TransactionReceipt = await config.signer.provider.waitForTransaction(
    deployResult.hash
  )

  const contract = new Contract(
    receipt.contractAddress,
    config.factory.interface,
    config.signer
  ) as any // set as any so we can override read-only deployTransaction field
  contract.deployTransaction = deployResult

  return contract as Contract

}
