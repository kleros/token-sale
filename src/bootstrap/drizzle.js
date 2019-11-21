import { Drizzle, generateStore } from 'drizzle'
import ERC20Seller from '../assets/contracts/token-sale.json'

const options = {
  contracts: [
    {
      ...ERC20Seller,
      networks: {
        42: { address: process.env.REACT_APP_KLEROS_TEST_SALE_ADDRESS },
        1: { address: process.env.REACT_APP_KLEROS_ICO_ADDRESS }
      }
    }
  ],
  polls: {
    accounts: 3000,
    blocks: 3000
  },
  web3: {
    fallback: {
      type: 'ws',
      url: process.env.REACT_APP_WEB3_FALLBACK_URL
    }
  }
}
export default new Drizzle(options, generateStore(options))
