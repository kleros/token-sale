import { Row } from 'antd'
import React from 'react'
import styled from 'styled-components'

const GraphContainer = styled.div`
  border-bottom: 1px solid white;
  border-left: 1px solid white;
  height: 150px;
  position: relative;
  margin-bottom: 80px;
`
const StyledOrdersRow = styled(Row)`
  position: absolute;
  bottom: 0px;
  width: 100%;
`
const SellOrderCol = styled.div`
  border-top: 2px solid #1a9cfc;
  background: #180a4b;
  display: inline-block;
`
const OrderTitle = styled.div`
  text-align: center;
  position: relative;
  bottom: -25px;
`
const Filler = styled.div`
  background: #180a4b;
  height: 27px;
  position: absolute;
  bottom: 0px;
  width: 100%;
`

const toLetters = (num) => {
    let mod = (num + 1) % 26
    let pow = (num + 1) / 26 | 0
    const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z')
    return pow ? toLetters(pow) + out : out
}

const SellOrdersGraph = ({ orders }) => {
  let lowPrice
  let highPrice
  if (orders.length !== 0) {
    lowPrice = orders[0].price
    highPrice = orders[orders.length - 1].price
  }

  const orderCols = orders.map((o, i) => {
    return (
      <div style={{
        width: `${1/orders.length * 100}%`,
        display: 'inline-block'
      }}>
        <SellOrderCol style={{
          height: `${parseInt(parseInt(((o.price - lowPrice) / (highPrice - lowPrice)) * 150))}px`,
          width: '100%'
        }}/>
        <OrderTitle>{toLetters(i)}</OrderTitle>
      </div>
    )
  })

  return (
    <GraphContainer>
      <StyledOrdersRow>
        {orderCols}
      </StyledOrdersRow>
      <Filler />
    </GraphContainer>
  )
}

export default SellOrdersGraph
