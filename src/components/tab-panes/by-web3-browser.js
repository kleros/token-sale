import { InputNumber, Row, Col, Select, Button, Icon } from 'antd'
import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { toBN, toWei, fromWei } from 'web3-utils'

import { useDrizzle, useDrizzleState } from '../../temp/drizzle-react-hooks'
import { StyledText, StyledValueText, StyledSubtext } from '../typography'
import { ethToWei, pricePerPNKToMaxVal, INFINITY } from '../../utils/numbers'

import './select-theme.css'

const StyledPane = styled.div`
  text-align: center;
  padding: 0px 40px 0px 40px;
`
const InputLabel = styled.div`
  margin: auto;
  p {
    margin-bottom: 5px;
  }
  text-align: left;
  margin-bottom: 9px;
`

const MaxPrice = styled.div`
  height: 100px;

  .maxPrice-inputs {
    width: 100%;
    display: none;
  }
`

const StyledButton = styled(Button)`
  color: white;
  height: 40px;
  margin-top: 70px;
  padding: 0px 33px;
  width: 100%;

  &:focus {
    color: white;
  }
  &:hover {
    color: white;
  }
  &:disabled {
    color: rgba(255, 255, 255, 0.35);
    border: none;
    background: rgba(77, 0, 180, 0.58);
  }
  &[disabled]:hover {
    color: rgba(255, 255, 255, 0.35);
    border: none;
    background: rgba(77, 0, 180, 0.58);
  }
`
const StyledSelect = styled(Select)`
  .ant-select-selection {
    background: rgba(255, 255, 255, 0.3);
    border: none;
    color: white;
    height: 40px;
    font-weight: 500;
    font-size: 18px;
    line-height: 21px;
    padding: 5px 20px;

    path {
      fill: white;
    }
  }

  .ant-select-dropdown-menu-item {
    background: rgba(255, 255, 255, 0.3);
    height: 100%;
    border: none;
    color: white;
    height: 40px;
    font-weight: 500;
    font-size: 18px;
    line-height: 21px;
    padding: 5px 20px;

    path {
      fill: white;
    }
  }

  width: 100%;
  margin-bottom: 18px;
`
const StyledOption = styled(Select.Option)`
`
const StyledInput = styled(InputNumber)`
  width: 100%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  height: 40px;
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  padding: 5px 20px;

  path {
    fill: white;
  }
`
const AmountLabel = styled.div`
  color: #fff;
  font-size: 14px;
  margin-top: 20px;
  text-align: left;
`
const AmountText = styled.div`
  color: #fff;
  font-size: 16px;
  text-align: left;
`
const ErrorMessage = styled.div`
  color: #FFFFFF;
  font-style: italic;
  font-weight: normal;
  font-size: 12px;
  line-height: 14px;
  margin-top: 15px;
  text-align: center;

  path {
    fill: #FF9900;
  }
`

const toLetters = (num) => {
    let mod = (num + 1) % 26
    let pow = (num + 1) / 26 | 0
    const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z')
    return pow ? toLetters(pow) + out : out
}

const ByWeb3Browser = ({ orders, divisor, disabled }) => {
  const options = orders.map((o, i) => (
    <StyledOption value={i}>
      {toLetters(i)} - Price at {fromWei(o.price.toString())} ETH
    </StyledOption>
  ))

  const { useCacheSend, drizzle } = useDrizzle()
  const { send, status } = useCacheSend('ERC20Seller', 'buy')

  const [ maxPriceIndex, setMaxPriceIndex ] = useState(0)
  const [ ethToSend, setEthToSend ] = useState('0')

  let maxWei = toBN(orders[0].amount).mul(toBN(orders[0].price)).div(toBN('1000000000000000000'))
  for (let i = 1; i <= maxPriceIndex; i++) {
    maxWei = maxWei.add(toBN(orders[i].amount).mul(toBN(orders[i].price)).div(toBN('1000000000000000000')))
  }

  const setETHAmount = (amount) => {
    if (!amount) amount = 0
    if (Number(amount) < 0) amount = 0
    let _weiAmount
    try {
      _weiAmount = toWei(String(amount))
    } catch (e) {
      _weiAmount = toWei(String(0))
    }

    if (toBN(_weiAmount).gt(maxWei)) _weiAmount = maxWei

    setEthToSend(_weiAmount.toString())
  }

  const maxPNK = (amount) => {
    // ETH
    let _ethAmount = toBN(amount)
    // PNK
    let pnkTotal = toBN(0)
    // Index
    let currentOrder = 0
    while (_ethAmount.gt(toBN(0))) {
      const _curETHAmount = toBN(orders[currentOrder].amount).mul(toBN(orders[currentOrder].price)).div(toBN('1000000000000000000'))
      if (_ethAmount.lte(_curETHAmount)) {
        pnkTotal = pnkTotal.add(_ethAmount.div(toBN(orders[currentOrder].price)).mul(toBN('1000000000000000000')))
        // break out of loop
        _ethAmount = toBN(0)
      } else {
        pnkTotal = pnkTotal.add(toBN(orders[currentOrder].amount))
        // Subtract amount
        _ethAmount = _ethAmount.sub(_curETHAmount)
        currentOrder++
      }
    }

    return pnkTotal.toString()
  }

  const curPNK = maxPNK(ethToSend)

  const buyOrder = () => {
    const _maxPriceConverted = toBN(orders[maxPriceIndex].price).mul(toBN(divisor))

    send(_maxPriceConverted.toString(),{
      value: ethToSend
    })
  }

  return (
    <StyledPane>
      <StyledText style={{'marginTop' : '30px'}}>Make a transaction with a web3 wallet</StyledText>
        <Row>
          <InputLabel>Maximum Price per PNK</InputLabel>
        </Row>
        <Row>
          <StyledSelect
            defaultValue={0}
            onChange={(v) => {setMaxPriceIndex(v)}}
            className={'customSelect'}
          >
            {options}
          </StyledSelect>
        </Row>
        <Row>
          <InputLabel>ETH to Contribute</InputLabel>
        </Row>
        <Row>
          <StyledInput
            placeholder={`0 ETH`}
            onChange={setETHAmount}
            value={fromWei(ethToSend.toString())}
          />
        </Row>
        <Row>
          <AmountLabel>Total</AmountLabel>
          <AmountText>{fromWei(curPNK.toString())} PNK</AmountText>
        </Row>
        <StyledButton onClick={buyOrder} disabled={disabled}>Contribute</StyledButton>
        {
          disabled ? (
            <ErrorMessage><Icon style={{marginRight: '8px'}} type="exclamation-circle" /> Unlock Metamask to contribute</ErrorMessage>
          ) : ''
        }
    </StyledPane>
  )
}

export default ByWeb3Browser
