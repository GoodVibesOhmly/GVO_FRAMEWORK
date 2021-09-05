import { useEffect } from 'react'
import {
  useWeb3,
  webs3States,
  usePrevious,
  useEthosContext,
} from '@ethereansos/interfaces-core'
import { ConnectWidget, Container } from '@ethereansos/interfaces-ui'

function Connect({ children }) {
  const { connect, connectionStatus } = useWeb3()
  const context = useEthosContext()
  const previousConnectionStatus = usePrevious(connectionStatus)

  useEffect(
    (props) => {
      if (
        connectionStatus === webs3States.CONNECTED &&
        previousConnectionStatus === webs3States.CONNECTING
      ) {
        console.log('Connnected')
      }
    },
    [connectionStatus, previousConnectionStatus]
  )

  return connectionStatus === webs3States.CONNECTED ? (
    children
  ) : (
    <Container>
      <ConnectWidget
        logo={`${process.env.PUBLIC_URL}/assets/img/ghostload.gif`}
        title="DFOhub"
        connect={connect}
        connectionStatus={connectionStatus}
        connectors={context.connectors}
      />
    </Container>
  )
}

export default Connect
