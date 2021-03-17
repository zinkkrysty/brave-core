/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

import { WalletInfo, OrderInfo, ExchangeRateInfo, Host } from '../lib/interfaces'
import { DialogFrame } from '../../ui/components/checkout/dialogFrame'
import { PaymentMethodPanel } from '../../ui/components/checkout/paymentMethodPanel'
import { PaymentProcessing } from '../../ui/components/checkout/paymentProcessing'
import { PaymentComplete } from '../../ui/components/checkout/paymentComplete'

import {
  createExchangeFormatter,
  formatLastUpdatedDate,
  formatTokenValue
} from '../lib/formatting'

type FlowState =
  'start' |
  'payment-processing' |
  'payment-complete'

interface AppProps {
  host: Host
  exchangeCurrency: string
}

export function App (props: AppProps) {
  const [flowState, setFlowState] = React.useState<FlowState>('start')
  const [rateInfo, setRateInfo] = React.useState<ExchangeRateInfo | null>(null)
  const [walletInfo, setWalletInfo] = React.useState<WalletInfo | null>(null)
  const [orderInfo, setOrderInfo] = React.useState<OrderInfo | null>(null)

  const showTitle =
    flowState !== 'payment-complete'

  const showBackground =
    flowState !== 'payment-complete' &&
    flowState !== 'payment-processing'

  React.useEffect(() => {
    props.host.setListener({
      onWalletUpdated: setWalletInfo,
      onRatesUpdated: setRateInfo,
      onOrderUpdated: setOrderInfo
    })
  }, [props.host])


  const onClose = () => {
    console.log('Done Done Done!')
    props.host.closeDialog()
  }

  const payWithWallet = () => {
    props.host.payWithWallet();
    setFlowState('payment-processing')
  }

  const paymentDone = () => {
    console.log('Payment Done!')
    setFlowState('payment-complete')
  }

  if (!rateInfo || !walletInfo || !orderInfo) {
    return (
      <DialogFrame
        showTitle={showTitle}
        showBackground={false}
        onClose={onClose}
      >
        Loading...
      </DialogFrame>
    )
  }

  const formatExchange = createExchangeFormatter(
    rateInfo.rate,
    props.exchangeCurrency)

  const amountNeeded = Math.max(0, orderInfo.total - walletInfo.balance)

  return (
    <DialogFrame
      showTitle={showTitle}
      showBackground={showBackground}
      onClose={onClose}
    >
      {
        flowState === 'start' ?
          <PaymentMethodPanel
            canUseCreditCard={false}
            rewardsEnabled={true}
            orderDescription={orderInfo.description}
            orderTotal={formatTokenValue(orderInfo.total)}
            orderTotalConverted={formatExchange(orderInfo.total)}
            walletBalance={formatTokenValue(walletInfo.balance)}
            walletBalanceConverted={formatExchange(walletInfo.balance)}
            walletLastUpdated={formatLastUpdatedDate(rateInfo.lastUpdated)}
            walletVerified={walletInfo.verified}
            hasSufficientFunds={amountNeeded <= 0}
            onPayWithCreditCard={() => {}}
            onPayWithWallet={payWithWallet}
            onShowAddFunds={() => {}}
          /> :
        flowState === 'payment-processing' ?
          <PaymentProcessing
            paymentDone={paymentDone}
          /> :
        flowState === 'payment-complete' ?
          <PaymentComplete
            onClose={onClose}/> : ''
      }
    </DialogFrame>
  )
}
