import { InputNumber, Row, Col, Select, Button, Icon } from 'antd'
import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { toBN, toWei, fromWei } from 'web3-utils'
import Translations from '../translations'

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
    font-size: 16px;
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
    font-size: 16px;
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

const ByWeb3Browser = ({ orders, divisor, disabled, language }) => {
  const options = orders.map((o, i) => (
    <StyledOption value={i}>
      {toLetters(i)} - {fromWei(o.price.toString())} ETH
    </StyledOption>
  ))

  const { useCacheSend, drizzle } = useDrizzle()
  const { send, status, transactions } = useCacheSend('ERC20Seller', 'buy')
  const drizzleState = useDrizzleState(drizzleState => {
    return ({
      drizzleStatusInitialized: drizzleState.drizzleStatus.initialized,
      web3Status: drizzleState.web3.status,
      networkID: drizzleState.web3.networkId
    })
  })

  useEffect(async () => {
    if (status === 'pending') {
      // Get location data
      const [ip, country] = await fetch('https://www.cloudflare.com/cdn-cgi/trace').then(async (res) => {
        const t = (await res.text()).split('\n')
        const ip = t[2].split('ip=')[1]
        const country = t[8].split('loc=')[1]
        return [ip, country]
      })
      // // Store users location
      const uri = drizzleState.networkID === 1 ?
        'https://hgyxlve79a.execute-api.us-east-2.amazonaws.com/production/token-sale' :
        'https://8aoprv935h.execute-api.us-east-2.amazonaws.com/staging/token-sale'
      const network = drizzleState.networkID === 42 ? 'kovan' : undefined

      fetch(uri, {
        method: 'PUT',
        body: JSON.stringify({
          txHash: transactions[transactions.length-1].txHash,
          country,
          ip,
          network
        })
      })
    }
  }, [status])

  const [ maxPriceIndex, setMaxPriceIndex ] = useState(0)
  const [ ethToSend, setEthToSend ] = useState('0')

  let maxWei = orders[0] ? toBN(orders[0].amount).mul(toBN(orders[0].price)).div(toBN('1000000000000000000')) : 0
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

    setEthToSend(_weiAmount.toString())
  }

  const maxPNK = (amount) => {
    // ETH
    let _ethAmount = toBN(amount)
    // PNK
    let pnkTotal = toBN(0)
    // Index
    let currentOrder = 0
    while (_ethAmount.gt(toBN(0)) && currentOrder <= maxPriceIndex) {
      if (!orders[currentOrder]) break
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

  const buyOrder = async () => {
    const _maxPriceConverted = toBN(orders[maxPriceIndex].price).mul(toBN(divisor))

    await send(_maxPriceConverted.toString(),{
      value: ethToSend
    })
    console.log(transactions)

  }

  return (
    <StyledPane>
      <StyledText style={{'marginTop' : '30px'}}>{Translations[language].body.web3.title}</StyledText>
        <Row>
          <InputLabel>{Translations[language].body.web3.maxPriceLabel}</InputLabel>
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
          <InputLabel>{Translations[language].body.web3.contributeLabel}</InputLabel>
        </Row>
        <Row>
          <StyledInput
            placeholder={`0 ETH`}
            onChange={setETHAmount}
            value={fromWei(ethToSend.toString())}
          />
        </Row>
        <Row>
          <AmountLabel>{Translations[language].body.web3.total}</AmountLabel>
          <AmountText>{fromWei(curPNK.toString())} PNK</AmountText>
        </Row>
        <StyledButton onClick={buyOrder} disabled={disabled}>{Translations[language].body.web3.contribute}</StyledButton>
        {
          disabled ? (
            <ErrorMessage><Icon style={{marginRight: '8px'}} type="exclamation-circle" /> {Translations[language].body.web3.unlock}</ErrorMessage>
          ) : ''
        }
    </StyledPane>
  )
}

export default ByWeb3Browser
