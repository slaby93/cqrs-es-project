import React from 'react'
import styled from 'styled-components'

const restartSystem = async () => {
  await fetch('http://localhost:9001/restart')
}

const RestartSystem = () => {
  return (
    <section>
      <p>This button will cause CommandProcessor Service to take all the events from EventStore and republish them on Kafka, which will cause all data to be recomputed.</p>
      <button onClick={React.useCallback(() => restartSystem())}>
        Reload events from EventStore
      </button>
    </section>
  )
}

const Styled = styled(RestartSystem)`

`

export default React.memo(Styled)