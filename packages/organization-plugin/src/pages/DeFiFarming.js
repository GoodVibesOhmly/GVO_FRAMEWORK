import React, { useEffect } from 'react'
import { usePlaceholder } from '@dfohub/core'
import T from 'prop-types'
import { useParams } from 'react-router-dom'

import useOrganization from '../hooks/useOrganization'

const DeFiFarming = ({ setTemplateState }) => {
  const organizationOverview = usePlaceholder('organizationDeFi')
  const params = useParams()
  const { organization, organizationHeader } = useOrganization(params.address)

  useEffect(() => {
    setTemplateState((s) => ({
      ...s,
      headerTitle: 'Organization DeFi Farming',
      mainMenu: 'organizationMenu',
      mainSubMenu: 'organizationSubMenuDeFi',
      beforeMenu: organizationHeader,
    }))
  }, [setTemplateState, organization, organizationHeader])

  return organizationOverview.map(({ Component, key }) => (
    <Component key={key} organization={organization} />
  ))
}

DeFiFarming.propTypes = {
  setTemplateState: T.func.isRequired,
}

export default DeFiFarming
