/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Reducer } from 'redux'
import { types } from '../constants/cryptoDotCom_types'

interface SupportedPair {
  base: string
  pair: string
  quote: string
  price: string
  quantity: string
}

function performSideEffect (fn: () => void): void {
  window.setTimeout(() => fn(), 0)
}

function reducePairs (rawPairs: SupportedPair[]) {
  if (!rawPairs || !rawPairs.length) {
    return {}
  }
  return rawPairs.reduce((pairs: object, currPair: SupportedPair) => {
    const { base, pair } = currPair
    pairs[base] = pairs[base]
      ? [...pairs[base], pair]
      : [pair]
    return pairs
  }, {})
}

const cryptoDotComReducer: Reducer<NewTab.State | undefined> = (state: NewTab.State, action) => {
  const payload = action.payload

  switch (action.type) {
    case types.ON_BTC_PRICE_OPT_IN:
      state = { ...state }
      state.cryptoDotComState = {
        ...state.cryptoDotComState,
        optInBTCPrice: true,
        fetchStatus: 'pending'
      }
      performSideEffect(async function () {
        chrome.cryptoDotCom.onInteraction()
      })
      break

    // TODO(simonhong): Remove this.
    // We will only show market after connected.
    case types.MARKETS_REQUESTED:
      state = { ...state }
      state.cryptoDotComState = {
        ...state.cryptoDotComState,
        fetchStatus: 'pending',
        optInMarkets: true
      }
      performSideEffect(async function () {
        chrome.cryptoDotCom.onInteraction()
      })
      break

    // TODO(simonhong): Remove this.
    case types.MARKETS_RECEIVED:
      state = { ...state }
      state.cryptoDotComState = {
        ...state.cryptoDotComState,
        fetchStatus: 'completed',
        tickerPrices: {
          ...state.cryptoDotComState.tickerPrices,
          ...payload.tickerPrices
        },
        losersGainers: payload.losersGainers,
        tradingPairs: payload.pairs || state.cryptoDotComState.tradingPairs
      }
      break

    case types.ALL_ASSETS_DETAILS_REQUESTED:
      state = { ...state }
      state.cryptoDotComState = {
        ...state.cryptoDotComState,
        fetchStatus: 'pending'
      }
      break

    case types.ALL_ASSETS_DETAILS_RECEIVED:
      state = { ...state }
      state.cryptoDotComState = {
        ...state.cryptoDotComState,
        fetchStatus: 'completed',
        charts: {
          ...state.cryptoDotComState.charts,
          ...payload.charts
        },
        tickerPrices: {
          ...state.cryptoDotComState.tickerPrices,
          ...payload.tickerPrices
        },
        depositAddresses: {
          ...state.cryptoDotComState.depositAddresses,
          ...payload.depositAddress
        },
        supportedPairs: reducePairs(payload.pairs) || {},
        tradingPairs: payload.pairs
      }
      break

    case types.ON_REFRESH_DATA:
      state = { ...state }
      state.cryptoDotComState = {
        ...state.cryptoDotComState,
        fetchStatus: 'refreshing'
      }
      break

    case types.HIDE_BALANCE:
      state = { ...state }
      state = {
        ...state,
        cryptoDotComState: {
          ...state.cryptoDotComState,
          hideBalance: payload.hide
        }
      }
      break

    case types.REFRESHED_DATA_RECEIVED:
      state = { ...state }
      state.cryptoDotComState = {
        ...state.cryptoDotComState,
        fetchStatus: 'completed',
        tickerPrices: {
          ...state.cryptoDotComState.tickerPrices,
          ...payload.tickerPrices
        },
        charts: {
          ...state.cryptoDotComState.charts,
          ...payload.charts
        },
        newsEvents: payload.newsEvents,
        losersGainers: payload.losersGainers,
        isConnected: payload.isConnected,
        accountBalances: payload.accountBalances,
        supportedPairs: payload.pairs ? reducePairs(payload.pairs) : state.cryptoDotComState.supportedPairs,
        tradingPairs: payload.pairs ? payload.pairs : state.cryptoDotComState.tradingPairs
      }
      break

    case types.ON_BUY_CRYPTO:
      performSideEffect(async function () {
        chrome.cryptoDotCom.onBuyCrypto()
      })
      break

    case types.ON_MARKETS_OPT_IN:
      state = { ...state }
      state.cryptoDotComState.optInMarkets = payload.show
      break

    default:
      break
  }

  return state
}

export default cryptoDotComReducer
