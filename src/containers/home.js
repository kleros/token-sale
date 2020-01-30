import { Button, Col, Divider, Input, Radio, Row, Tabs } from 'antd'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { toBN, fromWei, toWei } from 'web3-utils'
import {
  StyledHeading,
  StyledSubheading,
  StyledSubtext,
  StyledText,
  StyledValueText
} from '../components/typography'
import BreakLine from '../components/break-line'
import InformationCardsBox from '../components/information-cards-box'
import Table from '../components/table'
import ByAddressPane from '../components/tab-panes/by-address'
import ByWeb3Browser from '../components/tab-panes/by-web3-browser'
import SecondsInSubsale from '../components/seconds-in-subsale'
import PricePerPNK from '../components/price-per-pnk'
import SellOrdersGraph from '../components/sell-orders-graph'
import PurchaseAmountBox from '../components/purchase-amount-box.js'
import _404 from '../components/_404.js'
import { useDrizzle, useDrizzleState } from '../temp/drizzle-react-hooks'
import { ethToWei, truncateDecimalString, weiToEth } from '../utils/numbers'
import { ReactComponent as RightArrow } from '../assets/images/arrow-right-solid.svg'
import { ReactComponent as Clock } from '../assets/images/clock-regular.svg'
import { ReactComponent as Accepted } from '../assets/images/check-solid.svg'
import { ReactComponent as Rejected } from '../assets/images/times-solid.svg'
import HeaderImg from '../assets/images/header.png'
import Translations from '../components/translations'

const StyledCardContainer = styled.div`
  margin-top: 25px;

  .ant-tabs-card {
    .ant-tabs-content {
      background: rgba(255, 255, 255, 0.08);
      height: 515px;

      .ant-tabs-tabpane {
        padding: 16px;
      }
    }
    .ant-tabs-bar {
      border: none;
      height: 35px;
      margin: 0;

      .ant-tabs-tab-next {
        display: none;
      }

      .ant-tabs-nav-container {
        margin-bottom: 0px;
      }

      .ant-tabs-nav {
        height: 35px;
        width: 100%;

        .ant-tabs-tab {
          border-bottom: 1px solid #009aff;
          border-left: none;
          border-right: none;
          border-top: none;
          height: 34px;
          margin-right: 0px;
          text-align: center;
          width: 50%;
        }

        .ant-tabs-tab-active {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid #009aff;
          border-bottom: none;
          height: 35px;
        }
      }
    }
  }
`

const StyledTabText = styled(StyledText)`
  font-size: 14px;
  font-weight: 500;
`

const StyledSearch = styled(Input.Search)`
  .ant-input {
    background-color: rgba(255, 255, 255, 0.08) !important;
    border: none !important;
    border-radius: 3px;
    color: white !important;
    height: 40px;
  }

  .ant-btn {
    background: #009aff;
    border-radius: 3px;
    color: white;
    height: 40px;
    padding-top: 0px;
  }

  .ant-input-search.ant-input-search-enter-button {
    border: none;
  }
`

const StyledAccepted = styled(Accepted)`
  color: #009aff;
  height: 20px;
`

const StyledRejected = styled(Rejected)`
  color: red;
  height: 20px;
`

const StyledPending = styled(Clock)`
  color: white;
  height: 20px;
`

const SALE_TOTAL = '150000000'

export default ({ language }) => {
  useEffect(() => {
    window.location.href = 'https://kleros.io'
  })

  const { useCacheCall, useCacheEvents, drizzle } = useDrizzle()
  const drizzleState = useDrizzleState(drizzleState => ({
    loaded: drizzleState.drizzleStatus.initialized,
    account: drizzleState.accounts[0],
    networkID: drizzleState.web3.networkId
  }))

  if (!drizzleState.loaded) return <div>loading...</div>

  if (drizzleState.networkID && drizzleState.networkID !== 1) return <_404 />

  const [account, setAccount] = useState(drizzleState.account)

  // Set account when drizzle state loads
  useEffect(() => {
    setAccount(drizzleState.account)
  }, [drizzleState.account])

  let tokensForSale
  let numberOfSubsales
  let currentSubsaleNumber
  let valuationAndCutOff
  let startTime
  let secondsPerSubsale
  let bidIDs = []

  const amountForSaleToday =
    numberOfSubsales &&
    tokensForSale &&
    toBN(tokensForSale).div(toBN(numberOfSubsales))

  // Fetch all data for users bids
  const bids = {}
  const divisor = useCacheCall('ERC20Seller', 'divisor')
  const normalizedOrders = useCacheCall(['ERC20Seller'], call => {
    const openOrderIDs = call('ERC20Seller', 'getOpenOrders')

    if (openOrderIDs && divisor) {
      return openOrderIDs.map(_id => {
        const _order = call('ERC20Seller', 'orders', _id)
        if (_order) {
          const _orderCopy = { ..._order }
          _orderCopy.price = toBN(_order.price)
            .mul(toBN('1000000000000000000'))
            .div(toBN(divisor))
            .toString()
          return _orderCopy
        }
      })
    }
  })
  const sortedOrders =
    normalizedOrders &&
    normalizedOrders.sort((a, b) => {
      return toBN(a.price)
        .sub(toBN(b.price))
        .toNumber()
    })

  // if a change has been made the new order might come in as undefined. remove it
  if (sortedOrders && !sortedOrders[sortedOrders.length - 1]) sortedOrders.pop()

  // Parse bids to the table columns
  const columnData = []
  if (
    !bids.loading &&
    !bids.loadingValAndCutOffs &&
    amountForSaleToday &&
    startTime &&
    secondsPerSubsale
  )
    for (let i = 0; i < bids.bids.length; i++) {
      const _bid = bids.bids[i]
      const bidColData = {
        amount: null,
        price: null,
        date: null,
        status: null
      }

      const valAndCutOff = bids.valAndCutOffForSubsale[_bid.subsaleNumber]
      // currentCutOffBidMaxValuation will come back as 0 if all bids are accepted
      const currentCutOffBidMaxValuation =
        valAndCutOff.currentCutOffBidMaxValuation

      let contrib = 0
      if (toBN(_bid.maxValuation).gt(toBN(currentCutOffBidMaxValuation)))
        contrib = _bid.contrib
      else if (toBN(_bid.maxValuation).eq(toBN(currentCutOffBidMaxValuation)))
        if (_bid.bidID === valAndCutOff.currentCutOffBidID)
          contrib = valAndCutOff.currentCutOffBidContrib
        else if (_bid.bidID > valAndCutOff.currentCutOffBidID)
          contrib = _bid.contrib

      if (contrib > 0)
        if (currentSubsaleNumber === _bid.subsaleNumber)
          bidColData.status = <StyledPending />
        else bidColData.status = <StyledAccepted />
      else bidColData.status = <StyledRejected />

      bidColData.amount = truncateDecimalString(
        weiToEth(
          amountForSaleToday
            .mul(toBN(contrib.toString()))
            .div(toBN(valAndCutOff.valuation.toString()))
            .toString()
        ),
        0
      )

      bidColData.price = weiToEth(bids.bids[i].contrib.toString())

      // calcuate start date
      const _startTime = toBN(startTime)
      const _subsaleNumberMultiplyer = toBN(_bid.subsaleNumber - 1)
      const _secondsPerSubsale = toBN(secondsPerSubsale)
      bidColData.date = _startTime
        .add(_subsaleNumberMultiplyer.mul(_secondsPerSubsale))
        .toNumber()

      columnData[i] = bidColData
    }

  return (
    <div>
      <Row>
        <img src={HeaderImg} />
        <StyledHeading>{Translations[language].body.title}</StyledHeading>
      </Row>
      <Row style={{ marginBottom: '76px', marginTop: '-25px' }}>
        <Col lg={9}>
          <StyledSubheading>
            {Translations[language].body.contribute}
          </StyledSubheading>
          <StyledCardContainer>
            <Tabs type="card">
              <Tabs.TabPane
                key={1}
                tab={
                  <StyledTabText>
                    {Translations[language].body.basicHeading}
                  </StyledTabText>
                }
              >
                <ByAddressPane
                  language={language}
                  contributionAddress={
                    drizzle.contracts['ERC20Seller']
                      ? drizzle.contracts['ERC20Seller'].address
                      : 'loading...'
                  }
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                key={2}
                tab={
                  <StyledTabText>
                    {Translations[language].body.web3Heading}
                  </StyledTabText>
                }
              >
                <ByWeb3Browser
                  orders={sortedOrders}
                  disabled={!account || (!sortedOrders || !sortedOrders[0])}
                  divisor={divisor}
                  language={language}
                />
              </Tabs.TabPane>
            </Tabs>
          </StyledCardContainer>
        </Col>
        <Col lg={13} offset={1}>
          <BreakLine style={{ marginTop: '95px' }} />
          <StyledText style={{ marginBottom: '18px', marginTop: '18px' }}>
            {Translations[language].body.totals.title}
          </StyledText>
          <InformationCardsBox
            subtextMain={Translations[language].body.totals.amountForSale}
            noMiddleLine={true}
            textMain={`${SALE_TOTAL.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} PNK`}
            textSecondary={''}
            firstColSpan={24}
            secondColSpan={0}
          />
          <PurchaseAmountBox saleTotal={SALE_TOTAL} language={language} />
        </Col>
      </Row>
      <BreakLine />
      <Row style={{ margin: '45px 0px' }}>
        <Col lg={9}>
          <StyledSubheading>
            {Translations[language].orders.title}
          </StyledSubheading>
        </Col>
      </Row>
      <SellOrdersGraph
        orders={sortedOrders && sortedOrders[0] ? sortedOrders : []}
      />
      <Row>
        <Col lg={24}>
          <Table
            language={language}
            columnData={sortedOrders && sortedOrders[0] ? sortedOrders : []}
          />
        </Col>
      </Row>
    </div>
  )
}
