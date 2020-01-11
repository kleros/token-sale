import { Table } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { fromWei } from 'web3-utils'

import { useDrizzle, useDrizzleState } from '../temp/drizzle-react-hooks'
import MonthAbreviations from '../utils/month-abreviations'

import Translations from './translations'

const StyledTable = styled(Table)`
  .ant-table-content {
    background: rgba(255, 255, 255, 0.07);
    padding: 0px 8px;
    padding-top: 20px;

    td,
    th {
      border: none;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      padding: 5px 25px;
      font-size: 18px;
    }

    td {
      color: white;
    }

    th {
      color: white;
      opacity: 0.5;
    }

    td:last-child,
    th:last-child {
      border-right: none;
    }
  }

  .ant-table-thead {
    tr:nth-child(odd) {
      background: transparent;
    }
  }

  tr:nth-child(odd) {
    background: rgba(255, 255, 255, 0.07);
  }
  tr:nth-child(even) {
    background: transparent;
  }

  .ant-table-pagination {
    .ant-pagination-item-link {
      color: white;
    }

    .ant-pagination-item {
      border: none;
      background: transparent;
      font-size: 18px;
      a {
        color: white;
        opacity: 0.5;
      }
    }

    .ant-pagination-item-active {
      a {
        opacity: 1;
      }
    }
  }

  .ant-table::-webkit-scrollbar {
    display: none;
  }
`

const columns = language => [
  {
    title: Translations[language].orders.sellOrder,
    dataIndex: 'index',
    key: 'index'
  },
  {
    title: Translations[language].orders.price,
    dataIndex: 'price',
    key: 'price',
    render: val => fromWei(val.toString())
  },
  {
    title: Translations[language].orders.amount,
    dataIndex: 'amount',
    key: 'amount',
    render: val =>
      fromWei(val.toString())
        .toString()
        .split('.')[0]
  }
]

const toLetters = num => {
  let mod = (num + 1) % 26
  let pow = ((num + 1) / 26) | 0
  const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z')
  return pow ? toLetters(pow) + out : out
}

export default ({ columnData, language }) => {
  const _data = columnData.map((d, i) => ({
    ...d,
    index: toLetters(i)
  }))

  return <StyledTable columns={columns(language)} dataSource={_data} />
}
