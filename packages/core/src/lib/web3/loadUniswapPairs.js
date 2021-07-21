import web3Utils from 'web3-utils'

import { VOID_ETHEREUM_ADDRESS_EXTENDED } from '../constants'

import toSubArrays from './toSubArrays'
import loadBlockSearchTranches from './loadBlockSearchTranches'
import getLogs from './getLogs'
import loadTokenInfos from './loadTokenInfos'

async function loadUniswapPairs(
  { web3, context, networkId, web3ForLogs },
  address,
  secondToken
) {
  let pairCreatedTopic = web3Utils.sha3(
    'PairCreated(address,address,address,uint256)'
  )

  let myToken = !address
    ? []
    : address instanceof Array
    ? address.map((it) => web3.eth.abi.encodeParameter('address', it))
    : [web3.eth.abi.encodeParameter('address', address)]
  let uniswapPairs = []

  let blockSearchTranches = await loadBlockSearchTranches({
    web3,
    context,
    networkId,
  })

  let subArrays
  if (
    myToken.length === 0 ||
    (myToken.length === 1 && myToken[0] === VOID_ETHEREUM_ADDRESS_EXTENDED)
  ) {
    subArrays = toSubArrays(
      (await (await fetch(context.uniswapTokensURL)).json())?.tokens
        .filter((it) => it.chainId === networkId)
        .map((it) => web3.eth.abi.encodeParameter('address', it.address)),
      500
    )

    myToken = subArrays.splice(0, 1)[0]
  } else {
    uniswapPairs = uniswapPairs.filter(
      (it) =>
        myToken.indexOf(
          web3.eth.abi.encodeParameter('address', it.token0.address)
        ) !== -1 ||
        myToken.indexOf(
          web3.eth.abi.encodeParameter('address', it.token1.address)
        ) !== -1
    )
  }
  !subArrays &&
    secondToken &&
    myToken.push(web3.eth.abi.encodeParameter('address', secondToken))

  while (myToken) {
    for (const tranche of blockSearchTranches) {
      const logArgs = {
        address: context.uniSwapV2FactoryAddress,
        fromBlock: tranche[0],
        toBlock: tranche[1],
        topics: [pairCreatedTopic, myToken],
      }
      if (subArrays || secondToken) {
        logArgs.topics.push(myToken)
      }
      const logs = await getLogs(
        { web3, web3ForLogs, context, networkId },
        logArgs
      )

      if (!subArrays && !secondToken) {
        logArgs.topics = [logArgs.topics[0], [], myToken]
        logs.push(
          ...(await getLogs({ web3, web3ForLogs, context, networkId }, logArgs))
        )
      }

      for (const log of logs) {
        const pairTokenAddress = web3Utils.toChecksumAddress(
          web3.eth.abi.decodeParameters(['address', 'uint256'], log.data)[0]
        )
        if (uniswapPairs[pairTokenAddress]) {
          continue
        }

        const pairToken = {
          address: pairTokenAddress,
          decimals: '18',
          name: 'Uniswap V2 Pair',
        }
        const token0 = web3Utils.toChecksumAddress(
          web3.eth.abi.decodeParameter('address', log.topics[1])
        )
        const token1 = web3Utils.toChecksumAddress(
          web3.eth.abi.decodeParameter('address', log.topics[2])
        )
        try {
          pairToken.token0 = await loadTokenInfos(
            { web3, context },
            token0,
            undefined,
            true
          )

          pairToken.token1 = await loadTokenInfos(
            { web3, context },
            token1,
            undefined,
            true
          )

          pairToken.key = `${token0}_${token1}-${token1}_${token0}`
          pairToken.fromBlock = log.blockNumber + ''
          pairToken.isUniswapPair = true
          uniswapPairs.push(pairToken)
          pairToken.symbol =
            pairToken.token0.symbol + '/' + pairToken.token1.symbol
        } catch (e) {
          console.error(e)
        }
      }
    }
    myToken =
      subArrays && subArrays.length > 0 ? subArrays.splice(0, 1)[0] : undefined
  }

  return uniswapPairs
}

export default loadUniswapPairs