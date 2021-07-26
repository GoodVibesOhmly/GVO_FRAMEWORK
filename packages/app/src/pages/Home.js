import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@ethereansos/interfaces-ui'

const HomePage = ({ setTemplateState }) => {
  useEffect(() => {
    setTemplateState((s) => ({
      ...s,
      headerTitle: 'HOME',
      mainMenu: null,
      mainSubmenu: null,
    }))
  }, [setTemplateState])
  return (
    <Card>
      <Link to="/list">Organization list</Link>
    </Card>
  )
}

export default HomePage
