import React from 'react'
import {
  fromDecimals,
  getNetworkElement,
  useEthosContext,
  useWeb3,
  formatMoney,
  swap,
} from '@dfohub/core'
import { Balance } from '@dfohub/components'
import {
  Card,
  Typography,
  Chip,
  Link,
  CircularProgress,
} from '@dfohub/design-system'

import { OrganizationPropType } from '../../propTypes'
import { useOrganizationContext } from '../../OrganizationContext'
import useFetchWallets from '../../hooks/useFetchWallets'
import useFetchAmounts from '../../hooks/useFetchAmounts'

import style from './balance-list.module.scss'

export const BalanceList = ({ organization }) => {
  const {
    web3,
    networkId,
    web3ForLogs,
    wethAddress,
    walletAddress,
    ethosEvents,
    ipfsHttpClient,
  } = useWeb3()
  const context = useEthosContext()
  const { isEditMode, showProposalModal } = useOrganizationContext()
  const tokens = useFetchWallets({ web3, context, networkId })
  const amounts = useFetchAmounts(
    {
      context,
      web3,
      web3ForLogs,
      networkId,
      wethAddress,
    },
    organization,
    tokens
  )

  if (!organization) return <CircularProgress />

  const onSwapSubmit = async (values, token) => {
    if (!organization) {
      return
    }

    try {
      const ctx = await swap(
        {
          web3,
          context,
          networkId,
          ipfsHttpClient,
          walletAddress,
          ethosEvents,
        },
        organization,
        values.amount,
        token.address,
        values.token
      )

      showProposalModal({
        initialContext: ctx,
        title: ctx.title,
        onProposalSuccess: () => null,
      })
    } catch (e) {
      console.log('error swapping tokens', e)
    }
  }

  return (
    <Card
      headerClassName={style.cardHeader}
      contentClassName={style.root}
      Header={
        <Typography variant="h2" color="primary" fontFamily="secondary">
          {organization.name} Balances{' '}
          <Typography variant="h5" color="primary">
            (Tracked: ${formatMoney(amounts.cumulativeAmountDollar)})
          </Typography>{' '}
          <Link
            external
            href={
              getNetworkElement({ context, networkId }, 'etherscanURL') +
              'tokenHoldings?a=' +
              organization?.walletAddress
            }>
            <Chip size="small">
              <span role="img" aria-label="gem">
                💎
              </span>{' '}
              Etherscan
            </Chip>
          </Link>
        </Typography>
      }>
      {tokens.map((token, i) => (
        <Balance
          onSwapSubmit={(values) => onSwapSubmit(values, token)}
          key={i}
          token={token}
          tokenPrice={
            amounts.tokenAmounts[i]?.amountDollars &&
            formatMoney(amounts.tokenAmounts[i]?.amountDollars)
          }
          tokenAmount={
            amounts.tokenAmounts[i]?.amount &&
            fromDecimals(amounts.tokenAmounts[i]?.amount, token.decimals)
          }
          showActions={isEditMode}
          className={style.balance}
        />
      ))}
    </Card>
  )
}

BalanceList.propTypes = {
  organization: OrganizationPropType,
}

export default BalanceList
