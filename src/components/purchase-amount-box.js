import React from 'react'
import { toBN, fromWei, toWei } from 'web3-utils'
import { useDrizzle } from '../temp/drizzle-react-hooks'
import InformationCardsBox from './information-cards-box'
import Translations from './translations'

export default ({saleTotal, language}) => {
  const { useCacheEvents } = useDrizzle()
  const purchaseEvents = useCacheEvents('ERC20Seller', 'TokenPurchase', { fromBlock: 0 })

  let purchaseAmount = toBN(0)
  if (purchaseEvents) {
    purchaseEvents.forEach(e => {
      purchaseAmount = purchaseAmount.add(toBN(e.returnValues._amount))
    })
  }

  return (
    <InformationCardsBox
      subtextMain={Translations[language].body.totals.totalSold}
      subtextSecondary={Translations[language].body.totals.remaining}
      textMain={`${Number(fromWei(purchaseAmount.toString())).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} PNK`}
      textSecondary={`${Number(fromWei(toBN(toWei(saleTotal.toString())).sub(toBN(purchaseAmount)).toString()).toString()).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} PNK`}
    />
  )
}
