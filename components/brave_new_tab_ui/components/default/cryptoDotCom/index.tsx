/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as React from 'react'
const clipboardCopy = require('clipboard-copy')
import { ThemeProvider } from 'styled-components'

import createWidget from '../widget/index'
import { StyledTitleTab } from '../widgetTitleTab'

import {
  currencyNames,
} from './data'

import {
  SearchIcon,
  ShowIcon,
  HideIcon
} from '../../default/exchangeWidget/shared-assets'

import QRIcon from './assets/icons/qr-code.png'

import {
  ActionButton,
  AmountInputField,
  BackArrow,
  Balance,
  BasicBox,
  BlurIcon,
  Box,
  CryptoDotComIcon,
  FlexItem,
  ButtonGroup,
  Header,
  InputField,
  Link,
  List,
  ListItem,
  PlainButton,
  StyledTitle,
  StyledTitleText,
  SVG,
  Text,
  WidgetWrapper,
  UpperCaseText
} from './style'
import CryptoDotComLogo from './assets/cryptoDotCom-logo'
import { CaratLeftIcon } from 'brave-ui/components/icons'
import icons from './assets/icons'

// Utils
import { getLocale } from '../../../../common/locale'

interface TickerPrice {
  price: number
  volume: number
}

interface AssetRanking {
  lastPrice: number
  pair: string
  percentChange: string
}

interface ChartDataPoint {
  c: number
  h: number
  l: number
  o: number
  t: number
  v: number
}

enum MainViews {
  TOP,
  TRADE,
  EVENTS,
  BALANCE
}

enum AssetViews {
  DETAILS,
  TRADE,
  DEPOSIT
}

interface State {
  currentView: MainViews
  currentAssetView: AssetViews
  selectedBase: string
  selectedQuote: string
  clientAuthUrl: string
}

interface Props {
  showContent: boolean
  optInBTCPrice: boolean
  hideBalance: boolean
  isConnected: boolean
  accountBalances: Record<string, any>
  depositAddresses: Record<string, any>
  tickerPrices: Record<string, TickerPrice>
  losersGainers: Record<string, AssetRanking[]>
  supportedPairs: Record<string, string[]>
  tradingPairs: Array<Record<string, string>>
  newsEvents: Array<Record<string, string>>
  charts: Record<string, ChartDataPoint[]>
  stackPosition: number
  onShowContent: () => void
  onDisableWidget: () => void
  onBtcPriceOptIn: () => Promise<void>
  onUpdateActions: () => Promise<void>
  onAssetsDetailsRequested: (base: string, quote: string) => void
  onSetHideBalance: (hide: boolean) => void
  onIsConnected: (connected: boolean) => void
}
interface ChartConfig {
  data: Array<any>
  chartHeight: number
  chartWidth: number
}

// TODO(simonhong): Don't cache account related infos in local storage.
// We should fetch every time when we refer to.
class CryptoDotCom extends React.PureComponent<Props, State> {
  private refreshDataInterval: any
  private checkConnectedStateInterval: any

  constructor (props: Props) {
    super(props)
    this.state = {
      currentView: MainViews.TOP,
      currentAssetView: AssetViews.DETAILS,
      selectedBase: '',
      selectedQuote: '',
      clientAuthUrl: '',
    }
  }

  // TODO(simonhong): Don't trigger refresh when this widget is not visible.
  // Handle interval based on connect state changes here.
  componentDidUpdate(prevProps: Props) {
  }

  // TODO(simonhong): Use different interval for BTC and connected.
  componentDidMount () {
    // Only try refreshing when logged in state.
    chrome.cryptoDotCom.isLoggedIn(async (loggedIn: boolean) => {
      if (loggedIn) {
        chrome.cryptoDotCom.isConnected(async (isConnected: boolean) => {
          if (isConnected) {
            // Get initial data update at startup.
            await this.props.onUpdateActions()
            this.checkSetRefreshInterval()
          } else if (this.props.optInBTCPrice) {
            this.checkSetRefreshInterval()
          }
          this.props.onIsConnected(isConnected)
        })
        // Periodically check connect status if logged in.
        this.setCheckIsConnectedInterval()
      } else if (this.props.optInBTCPrice) {
        this.checkSetRefreshInterval()
      }
    })

    this.getClientURL()
  }

  componentWillUnmount () {
    this.clearIntervals()
  }

  getClientURL = () => {
    chrome.cryptoDotCom.getClientUrl((clientAuthUrl: string) => {
      this.setState({ clientAuthUrl })
    })
  }

  setCheckIsConnectedInterval = () => {
    if (!this.checkConnectedStateInterval) {
      this.checkConnectedStateInterval = setInterval(() => {
        chrome.cryptoDotCom.isConnected((isConnected: boolean) => {
          this.props.onIsConnected(isConnected)
        })
      }, 30000)
    }
  }

  checkSetRefreshInterval = () => {
    if (!this.refreshDataInterval) {
      this.refreshDataInterval = setInterval(async () => {
        await this.props.onUpdateActions()
          .catch((_e) => console.debug('Could not update crypto.com data'))
      }, 30000)
    }
  }

  clearIntervals = () => {
    clearInterval(this.refreshDataInterval)
    this.refreshDataInterval = null

    clearInterval(this.checkConnectedStateInterval)
    this.checkConnectedStateInterval = null
  }

  setMainView = (view: MainViews) => {
    this.setState({
      currentView: view
    })
  }

  clearAsset = () => {
    this.setState({
      selectedBase: '',
      selectedQuote: ''
    })
  }

  btcPriceOptIn = () => {
    this.props.onBtcPriceOptIn()
    this.checkSetRefreshInterval()
  }

  handleAssetClick = async (base: string, quote: string, view: AssetViews) => {
    this.setState({
      selectedBase: base,
      selectedQuote: quote || '',
      currentAssetView: view || AssetViews.DETAILS
    })
    await this.props.onAssetsDetailsRequested(base, quote ? quote : 'USDT')
  }

  onClickConnectToCryptoDotCom = () => {
    window.open(this.state.clientAuthUrl, '_self', 'noopener')
  }

  plotData ({ data, chartHeight, chartWidth }: ChartConfig) {
    const pointsPerDay = 4
    const daysInrange = 7
    const yHighs = data.map((point: ChartDataPoint) => point.h)
    const yLows = data.map((point: ChartDataPoint) => point.l)
    const dataPoints = data.map((point: ChartDataPoint) => point.c)
    const chartAreaY = chartHeight - 2
    const max = Math.max(...yHighs)
    const min = Math.min(...yLows)
    const pixelsPerPoint = (max - min) / chartAreaY
    return dataPoints
      .map((v, i) => {
        const y = (v - min) / pixelsPerPoint
        const x = i * (chartWidth / (pointsPerDay * daysInrange))
        return `${x},${chartAreaY - y}`
      })
      .join('\n')
  }

  renderPreOptIn () {
    const { optInBTCPrice } = this.props
    const currency = 'BTC'
    const { price = null } = this.props.tickerPrices[`${currency}_USDT`] || {}

    const losersGainers = transformLosersGainers(this.props.losersGainers || {})
    const { percentChange = null } = losersGainers[currency] || {}
    return (
      <>
        <Box isFlex={true} $height={48}>
          <FlexItem $pr={5}>
            {renderIconAsset(currency.toLowerCase())}
          </FlexItem>
          <FlexItem>
              <Text>{currency}</Text>
              <Text small={true} textColor='light'>{currencyNames[currency]}</Text>
          </FlexItem>
          <FlexItem textAlign='right' flex={1}>
            {optInBTCPrice ? (
              <>
                {(price !== null) && <Text>{formattedNum(price)}</Text>}
                {(percentChange !== null) && <Text textColor={getPercentColor(percentChange)}>{percentChange}%</Text>}
              </>
            ) : (
              <PlainButton onClick={this.btcPriceOptIn} textColor='green' inline={true}>
                {getLocale('cryptoDotComWidgetShowPrice')}
              </PlainButton>
            )}
          </FlexItem>
        </Box>
        <Text $pt='1em' $fontSize={14}>
          {getLocale('cryptoDotComWidgetCopyOne')}
        </Text>
        <ActionButton onClick={this.onClickConnectToCryptoDotCom} $mt={10} $mb={15}>
          {getLocale('cryptoDotComWidgetConnect')}
        </ActionButton>
      </>
    )
  }

  renderAssetDetail () {
    const { selectedBase: currency } = this.state
    const { price = null, volume = null } = this.props.tickerPrices[`${currency}_USDT`] || {}
    const chartData = this.props.charts[`${currency}_USDT`] || []
    const pairs = this.props.supportedPairs[currency] || []
    const losersGainers = transformLosersGainers(this.props.losersGainers || {})
    const { percentChange = null } = losersGainers[currency] || {}

    const chartHeight = 100
    const chartWidth = 309
    return (
      <Box $p={0}>
        <FlexItem
          hasPadding={true}
          isFlex={true}
          isFullWidth={true}
          hasBorder={true}
        >
          <FlexItem>
            <BackArrow onClick={this.clearAsset}>
              <CaratLeftIcon />
            </BackArrow>
          </FlexItem>
          <FlexItem $pr={5}>
            {renderIconAsset(currency.toLowerCase())}
          </FlexItem>
          <FlexItem flex={1}>
            <Text>{currency}</Text>
            <Text small={true} textColor='light'>
              {currencyNames[currency]}
            </Text>
          </FlexItem>
          <FlexItem $pl={5}>
            <ActionButton onClick={this.handleAssetClick.bind(this, currency, null, AssetViews.DEPOSIT)} small={true} light={true}>
              <UpperCaseText>
              {getLocale('cryptoDotComWidgetDeposit')}
              </UpperCaseText>
            </ActionButton>
          </FlexItem>
        </FlexItem>
        <FlexItem
          hasPadding={true}
          isFullWidth={true}
          hasBorder={true}
        >
          {(price !== null) && <Text
            inline={true}
            large={true}
            weight={500}
            $mr='0.5rem'
          >
            {formattedNum(price)} USDT
          </Text>}
          {(percentChange !== null) && <Text inline={true} textColor={getPercentColor(percentChange)}>{percentChange}%</Text>}
          <SVG viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <polyline
              fill='none'
              stroke='#44B0FF'
              strokeWidth='3'
              points={this.plotData({
                data: chartData,
                chartHeight,
                chartWidth
              })}
            />
          </SVG>
        <Text small={true} textColor='xlight'>
          {getLocale('cryptoDotComWidgetGraph')}
        </Text>
        </FlexItem>
        <FlexItem
          hasPadding={true}
          isFullWidth={true}
        >
          <BasicBox $mt='0.2em'>
            <Text small={true} textColor='light' $pb='0.2rem'>
              <UpperCaseText>
                {getLocale('cryptoDotComWidgetVolume')}
              </UpperCaseText>
            </Text>
            {volume && <Text weight={500}>{formattedNum(volume)} USDT</Text>}
          </BasicBox>
          <BasicBox $mt='1em'>
            <Text small={true} textColor='light' $pb='0.2rem'>
              <UpperCaseText>
                {getLocale('cryptoDotComWidgetPairs')}
              </UpperCaseText>
            </Text>
            {pairs.map((pair, i) => {
              const [base, quote] = pair.split('_')
              const pairName = pair.replace('_', '/')
              return (
                <ActionButton onClick={this.handleAssetClick.bind(this, base, quote, AssetViews.TRADE)} key={pair} small={true} inline={true} $mr={i === 0 ? 5 : 0} $mb={5}>
                  {pairName}
                </ActionButton>
              )
            })}
          </BasicBox>
        </FlexItem>
      </Box>
    )
  }

  renderTitle () {
    return (
      <Header showContent={this.props.showContent}>
        <StyledTitle>
          <CryptoDotComIcon>
            <CryptoDotComLogo />
          </CryptoDotComIcon>
          <StyledTitleText>
            {'Crypto.com'}
          </StyledTitleText>
        </StyledTitle>
      </Header>
    )
  }

  renderTitleTab () {
    const { onShowContent, stackPosition } = this.props

    return (
      <StyledTitleTab onClick={onShowContent} stackPosition={stackPosition}>
        {this.renderTitle()}
      </StyledTitleTab>
    )
  }

  renderNav () {
    const { currentView } = this.state
    return (
      <BasicBox isFlex={true} justify="start" $mb={13.5}>
        <PlainButton $pl="0" weight={500} textColor={currentView === MainViews.TOP ? 'white' : 'light'} onClick={this.setMainView.bind(null, MainViews.TOP)}>{getLocale('cryptoDotComWidgetTop')}</PlainButton>
        <PlainButton weight={500} textColor={currentView === MainViews.TRADE ? 'white' : 'light'} onClick={this.setMainView.bind(null, MainViews.TRADE)}>{getLocale('cryptoDotComWidgetTrade')}</PlainButton>
        <PlainButton weight={500} textColor={currentView === MainViews.EVENTS ? 'white' : 'light'} onClick={this.setMainView.bind(null, MainViews.EVENTS)}>{getLocale('cryptoDotComWidgetEvents')}</PlainButton>
        <PlainButton weight={500} textColor={currentView === MainViews.BALANCE ? 'white' : 'light'} onClick={this.setMainView.bind(null, MainViews.BALANCE)}>{getLocale('cryptoDotComWidgetBalance')}</PlainButton>
      </BasicBox>
    )
  }

  renderCurrentView () {
    const { currentView } = this.state
    if (currentView === MainViews.TOP) {
      return <TopMovers
        losersGainers={this.props.losersGainers}
        handleAssetClick={this.handleAssetClick}
      />
    }

    if (currentView === MainViews.TRADE) {
      return <Trade
        tickerPrices={this.props.tickerPrices}
        losersGainers={this.props.losersGainers}
        tradingPairs={this.props.tradingPairs}
        handleAssetClick={this.handleAssetClick}
      />
    }

    if (currentView === MainViews.BALANCE) {
      return <BalanceSummary
        hideBalance={this.props.hideBalance}
        onSetHideBalance={this.props.onSetHideBalance}
        availableBalance={this.props.accountBalances.total_balance}
        holdings={this.props.accountBalances.accounts}
      />
    }

    if (currentView === MainViews.EVENTS) {
      return <Events newsEvents={this.props.newsEvents} />
    }

    return null;
  }

  getAvailableBalanceForCurrency = (currency: string) => {
    const account = this.props.accountBalances.accounts.find((account: Record<string, any>) => account.currency === currency)
    return normalizeAvailable(account.available, account.currency_decimals)
  }

  renderAssetView () {
    const { currentAssetView, selectedBase, selectedQuote } = this.state

    if (currentAssetView === AssetViews.DETAILS) {
      return this.renderAssetDetail()
    }

    if (currentAssetView === AssetViews.TRADE) {
      const baseAvailable = this.getAvailableBalanceForCurrency(selectedBase)
      const quoteAvailable = this.getAvailableBalanceForCurrency(selectedQuote)
      const pair = this.props.tradingPairs.filter(pair => pair.base === selectedBase && pair.quote === selectedQuote)
      return <AssetTrade
        tickerPrices={this.props.tickerPrices}
        availableBalanceBase={baseAvailable}
        availableBalanceQuote={quoteAvailable}
        base={selectedBase}
        quote={selectedQuote}
        priceDecimals={pair[0] ? pair[0].price : '0'}
        quantityDecimals={pair[0] ? pair[0].quantity : '0'}
        handleBackClick={this.clearAsset}
      />
    }

    if (currentAssetView === AssetViews.DEPOSIT) {
      const depositAddress = this.props.depositAddresses[selectedBase]
      return <AssetDeposit
        assetAddress={depositAddress ? depositAddress.address : ''}
        assetQR={depositAddress ? depositAddress.qr_code : ''}
        base={selectedBase}
        handleBackClick={this.clearAsset}
      />
    }

    return null
  }

  renderIndex () {
    const { selectedBase } = this.state

    if (selectedBase) {
      return this.renderAssetView()
    } else {
      return <>
        {this.renderNav()}
        {this.renderCurrentView()}
      </>
    }
  }

  render () {
    if (!this.props.showContent) {
      return this.renderTitleTab()
    }

    return (
      <ThemeProvider theme={{
          secondary: 'rgba(15, 28, 45, 0.7)',
          primary: '#44B0FF',
          danger: 'rgba(234, 78, 92, 1)'
        }}>
        <WidgetWrapper>
          {this.renderTitle()}
          {(this.props.isConnected) ? (
            this.renderIndex()
          ) : (
            this.renderPreOptIn()
          )}
        </WidgetWrapper>
      </ThemeProvider>
    )
  }
}

export const CryptoDotComWidget = createWidget(CryptoDotCom)

// Supporting Components

function AssetDeposit ({
  assetAddress,
  assetQR,
  base,
  handleBackClick
}: any) {
  const [showQR, setShowQR] = React.useState(false)

  return showQR
  ? (
    <Box isFlex={true} column={true} $p={10}>
      <img src={assetQR} />
      <ActionButton onClick={() => setShowQR(false)} $mt={10} small={true} light={true} isFullWidth={false}>
        Done
      </ActionButton>
    </Box>
  ) : (
    <Box $p={0}>
      <FlexItem
        hasPadding={true}
        isFlex={true}
        isFullWidth={true}
        hasBorder={true}
      >
        <FlexItem>
          <BackArrow onClick={handleBackClick}>
            <CaratLeftIcon />
          </BackArrow>
        </FlexItem>
        <FlexItem $pr={5}>
          {renderIconAsset(base.toLowerCase())}
        </FlexItem>
        <FlexItem flex={1}>
          <Text>{base}</Text>
          <Text small={true} textColor='light'>
            {currencyNames[base]}
          </Text>
        </FlexItem>
        <FlexItem $pl={5}>
          <PlainButton onClick={() => setShowQR(true)}>
            <img width={25} src={QRIcon} />
          </PlainButton>
        </FlexItem>
      </FlexItem>
      <FlexItem
        $p='0.5em'
        isFullWidth={true}
      >
        <Text $fontSize={13} weight={600}>{base} Address</Text>
        <Text $fontSize={13} breakWord={true}>{assetAddress}</Text>
        <ActionButton onClick={() => copyToClipboard(assetAddress)} $mt={5} $mb={15} small={true} light={true} isFullWidth={false}>
          {getLocale('cryptoDotComWidgetCopyAddress')}
        </ActionButton>
        <Text $fontSize={13} weight={600}>{getLocale('cryptoDotComWidgetSendCaveatHeading', { currency: base })}</Text>
        <Text $fontSize={13}>{getLocale('cryptoDotComWidgetSendCaveatBody', { currency: base })}</Text>
      </FlexItem>
    </Box>
  )
}

function AssetTrade ({
  base,
  quote,
  availableBalanceBase,
  availableBalanceQuote,
  handleBackClick,
  tickerPrices,
  priceDecimals,
  quantityDecimals,
}: Record<string, any>) {

  enum TradeModes {
    BUY = 'buy',
    SELL = 'sell'
  }

  const tradeModeLocaleStrings = {
    buy: getLocale('cryptoDotComWidgetBuy'),
    sell: getLocale('cryptoDotComWidgetSell')
  }

  enum Percentages {
    twentyFive = 25,
    fifty = 50,
    seventyFive = 75,
    onehundred = 100
  }

  const confirmDelay = 15

  const [tradeMode, setTradeMode] = React.useState(TradeModes.BUY)
  const [tradePercentage, setTradePercentage] = React.useState<number | null>(null)
  const [tradeAmount, setTradeAmount] = React.useState('')
  const [showConfirmScreen, setConfirmScreen] = React.useState(false)
  const [counter, setCounter] = React.useState(confirmDelay)

  let intervalId: any;
  let timerId: any;
  const { price: unitPrice = null } = tickerPrices[`${base}_${quote}`] || {}
  const approxTotal = Number(tradeAmount) * unitPrice

  const handlePercentageClick = (percentage: number) => {
    const availableBalance =
        (tradeMode === TradeModes.BUY ? availableBalanceQuote : availableBalanceBase)
    const amount = (percentage / 100) * availableBalance
    setTradeAmount(`${amount}`)
    setTradePercentage(percentage)
  }

  const handleAmountChange = ({ target }: any) => {
    const { value } = target
    if (value === "." || !Number.isNaN(value * 1)) {
      setTradeAmount(value)
      setTradePercentage(null)
    }
  }

  const getPlaceholderText = () => tradeMode === TradeModes.BUY ? (
    getLocale('cryptoDotComWidgetTradeTo', {
      fromCurrency: quote,
      toCurrency: base
    })
  ) : (
    getLocale('cryptoDotComWidgetTradeTo', {
      fromCurrency: base,
      toCurrency: quote
    })
  )

  React.useEffect(() => {
    if (showConfirmScreen) {
      timerId = counter > 0 && setInterval(() => {
        if (counter > 0) {
          console.log(counter)
          setCounter(counter - 1)
        }
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [counter, showConfirmScreen]);

  const clearTimers = () => {
    clearInterval(intervalId)
    clearTimeout(timerId)
    setCounter(confirmDelay)
  }

  const handlePurchaseClick = () => {
    setConfirmScreen(true)
  }

  const handleConfirmClick = () => {
    // Call order api.
    const order = {
      'instrument_name': `${base}_${quote}`,
      'type': 'MARKET',
    }

    if (tradeMode === TradeModes.BUY) {
      order['side'] = 'BUY'
      order['notional'] = normalizeAvailable(approxTotal.toString(), Number(priceDecimals))
    } else {
      order['side'] = 'SELL'
      order['quantity'] = normalizeAvailable(tradeAmount.toString(), Number(quantityDecimals))
    }

    // Do we need show order feedback?
    chrome.cryptoDotCom.createMarketOrder(order , (success: boolean) => { console.log(success)})
    clearTimers()
    setTradeAmount('')
    setConfirmScreen(false)
  }

  // Reset amount whenever changing between buy/sell.
  const handleSetTradeMode = (mode: TradeModes) => {
    setTradeMode(mode)
    setTradeAmount('')
  }

  const handleCancelClick = () => {
    clearTimers()
    setConfirmScreen(false)
  }

  const buyingString = getLocale('cryptoDotComWidgetBuying')
  const sellingString = getLocale('cryptoDotComWidgetSelling')
  return showConfirmScreen ? (
    <>
      <Box>
        <Text center={true} weight={600} $pb={15}>{getLocale('cryptoDotComWidgetConfirmOrder')}</Text>
        <BasicBox $pb={7}>
          <Text weight={600} textColor='light' $fontSize={12}>{tradeMode === TradeModes.BUY ? buyingString : sellingString}</Text>
          <Text $fontSize={16}>{tradeAmount} {base}</Text>
        </BasicBox>
        <BasicBox $pb={7}>
          <Text weight={600} textColor='light' $fontSize={12}>*{getLocale('cryptoDotComWidgetApproxPrice')}</Text>
          <Text $fontSize={16}>{quote === 'USDT' ? formattedNum(unitPrice) : unitPrice} {base}/{quote}</Text>
        </BasicBox>
        <BasicBox $pb={7}>
          {tradeMode === TradeModes.BUY ? (
            <Text weight={600} textColor='light' $fontSize={12}>*{getLocale('cryptoDotComWidgetApproxTotalSpent')}</Text>
          ) : (
            <Text weight={600} textColor='light' $fontSize={12}>*{getLocale('cryptoDotComWidgetApproxTotalReceived')}</Text>
          )}
          <Text $fontSize={16}>{quote === 'USDT' ? formattedNum(approxTotal) : approxTotal} {quote}</Text>
        </BasicBox>
        <Text textColor='light' $fontSize={12}>* {getLocale('cryptoDotComWidgetApproxFootnote')}</Text>
      </Box>
      <BasicBox $pt={15}>
        <ActionButton onClick={handleConfirmClick}>{getLocale('cryptoDotComWidgetConfirm')} ({counter}s)</ActionButton>
        <PlainButton $pb={5} onClick={handleCancelClick} $pt={10} $m='0 auto' textColor='light'>{getLocale('cryptoDotComWidgetCancel')}</PlainButton>
      </BasicBox>
    </>
  ) : (
    <Box $p={0}>
      <FlexItem
        hasPadding={true}
        isFlex={true}
        isFullWidth={true}
        hasBorder={true}
      >
        <FlexItem>
          <BackArrow onClick={handleBackClick}>
            <CaratLeftIcon />
          </BackArrow>
        </FlexItem>
        <FlexItem $pr={5}>
          {renderIconAsset(base.toLowerCase())}
        </FlexItem>
        <FlexItem flex={1}>
          <Text>{base}</Text>
          <Text small={true} textColor='light'>
            {currencyNames[base]}
          </Text>
        </FlexItem>
        <FlexItem $pl={5}>
          <ButtonGroup>
            <PlainButton onClick={() => handleSetTradeMode(TradeModes.BUY)} textColor='green'>Buy</PlainButton>
            <PlainButton onClick={() => handleSetTradeMode(TradeModes.SELL)} textColor='red'>Sell</PlainButton>
          </ButtonGroup>
        </FlexItem>
      </FlexItem>
      <FlexItem
        hasPadding={true}
        isFullWidth={true}
        hasBorder={true}
      >
        {tradeMode === TradeModes.BUY ? (
          <Text $mt={15} center={true}>{availableBalanceQuote} {quote} {getLocale('cryptoDotComWidgetAvailable')}</Text>
        ) : (
          <Text $mt={15} center={true}>{availableBalanceBase} {base} {getLocale('cryptoDotComWidgetAvailable')}</Text>
        )}
        <AmountInputField
          $mt={10} $mb={10}
          placeholder={getPlaceholderText()}
          onChange={handleAmountChange}
          value={tradeAmount}
        />
        <BasicBox isFlex={true} justify="center" $mb={13.5}>
          {Object.values(Percentages).map(percentage => {
            return (typeof percentage === 'number') && (
              <PlainButton
                key={percentage}
                weight={500}
                textColor={tradePercentage === percentage ? 'white' : 'light'}
                onClick={() => handlePercentageClick(percentage)}
              >
                {percentage}%
              </PlainButton>
            )
          })}
        </BasicBox>
      </FlexItem>
      <FlexItem
        hasPadding={true}
        isFullWidth={true}
      >
        <ActionButton onClick={handlePurchaseClick} disabled={!tradeAmount} textOpacity={tradeAmount ? 1 : 0.6} $bg={tradeMode === TradeModes.BUY ? 'green' : 'red-bright'} upperCase={false}>{tradeModeLocaleStrings[tradeMode]} {base}</ActionButton>
      </FlexItem>
    </Box>
  )
}

// TODO(simonhong): Rename this.
function normalizeAvailable (available: string, currency_decimals: number) {
  return Number(Number(available).toFixed(currency_decimals)).toString()
}

function BalanceSummary ({
  onSetHideBalance = (hide: boolean) => {},
  hideBalance = true,
  availableBalance = '',
  holdings = [
    { currency: '', available: '', currency_decimals: 0 }
  ]
}) {
  // Only shows non-empty holdings.
  holdings = holdings.filter(item => item.available !== '0')

  return <>
    <BasicBox isFlex={true} $mb={18}>
      <FlexItem>
        <Text textColor='light' $mb={5} $fontSize={12}>{getLocale('cryptoDotComWidgetAvailableBalance')}</Text>
        <Balance hideBalance={hideBalance}>
          <Text lineHeight={1.15} $fontSize={21}>{formattedNum(Number(availableBalance))}</Text>
        </Balance>
      </FlexItem>
      <FlexItem>
        <BlurIcon onClick={() => onSetHideBalance(!hideBalance)}>
          {
            hideBalance
            ? <ShowIcon />
            : <HideIcon />
          }
        </BlurIcon>
      </FlexItem>
    </BasicBox>
    <Text textColor='light' $mb={5} $fontSize={12}>{getLocale('cryptoDotComWidgetHoldings')}</Text>
    <List>
      {holdings.map(({currency, available, currency_decimals}) => {
        return (
          <ListItem key={currency} isFlex={true} $height={40}>
            <FlexItem $pl={5} $pr={5}>
              {renderIconAsset(currency.toLowerCase())}
            </FlexItem>
            <FlexItem>
              <Text>{currency}</Text>
            </FlexItem>
            <FlexItem textAlign='right' flex={1}>
              <Balance hideBalance={hideBalance}>
                {(available !== null) && <Text lineHeight={1.15}>{normalizeAvailable(available, currency_decimals)}</Text>}
              </Balance>
            </FlexItem>
          </ListItem>
        )
      })}
    </List>
  </>
}

function TopMovers ({
  losersGainers = {},
  handleAssetClick
}: any) {
  enum FilterValues {
    LOSERS = 'losers',
    GAINERS = 'gainers'
  }

  const [filter, setFilter] = React.useState(FilterValues.GAINERS);

  const sortTopMovers = (a: Record<string, any>, b: Record<string, any>) => {
    if (filter === FilterValues.GAINERS) {
      return b.percentChange - a.percentChange
    } else {
      return a.percentChange - b.percentChange
    }
  }

  return <>
    <ButtonGroup>
      <PlainButton onClick={() => setFilter(FilterValues.GAINERS)} isActive={filter === FilterValues.GAINERS}>{getLocale('cryptoDotComWidgetGainers')}</PlainButton>
      <PlainButton onClick={() => setFilter(FilterValues.LOSERS)} isActive={filter === FilterValues.LOSERS}>{getLocale('cryptoDotComWidgetLosers')}</PlainButton>
    </ButtonGroup>
    <List>
      {losersGainers[filter] && losersGainers[filter]
        .sort(sortTopMovers)
        .map((asset: Record<string, any>) => {
        const currency = asset.pair.split('_')[0];
        const { percentChange, lastPrice: price } = asset

        return (
          <ListItem key={currency} isFlex={true} onClick={() => handleAssetClick(currency)} $height={48}>
            <FlexItem $pl={5} $pr={5}>
              {renderIconAsset(currency.toLowerCase())}
            </FlexItem>
            <FlexItem>
              <Text>{currency}</Text>
              <Text small={true} textColor='light'>{currencyNames[currency]}</Text>
            </FlexItem>
            <FlexItem textAlign='right' flex={1}>
              {(price !== null) && <Text>{formattedNum(price)}</Text>}
              {(percentChange !== null) && <Text textColor={getPercentColor(percentChange)}>{percentChange}%</Text>}
            </FlexItem>
          </ListItem>
        )
      })}
    </List>
  </>
}

function Trade ({
  tickerPrices = {},
  losersGainers = {},
  tradingPairs = [],
  handleAssetClick
}: any) {
  const assetRankings = transformLosersGainers(losersGainers)

  enum FilterValues {
    BTC = 'BTC',
    CRO = 'CRO',
    USDT = 'USDT'
  }

  const [filter, setFilter] = React.useState(FilterValues.BTC)
  const [searchInput, setSearchInput] = React.useState('')

  const handleSearchChange = ({ target }: any) => {
    const { value } = target
    setSearchInput(value)
  }

  const searchFilter = (pair: Record<string, string>) => {
    if (searchInput) {
      const search = new RegExp(searchInput, 'i')
      return search.test(pair.base)
    } else {
      return pair;
    }
  }

  return <>
    <ButtonGroup>
      <PlainButton onClick={() => setFilter(FilterValues.BTC)} isActive={filter === FilterValues.BTC}>BTC</PlainButton>
      <PlainButton onClick={() => setFilter(FilterValues.CRO)} isActive={filter === FilterValues.CRO}>CRO</PlainButton>
      <PlainButton onClick={() => setFilter(FilterValues.USDT)} isActive={filter === FilterValues.USDT}>USDT</PlainButton>
    </ButtonGroup>
    <Box isFlex={true} $height={30} hasBottomBorder={false}>
      <img width={15} src={SearchIcon} />
      <InputField value={searchInput} onChange={handleSearchChange} placeholder={getLocale('cryptoDotComWidgetSearch')} />
    </Box>
    <List>
      {tradingPairs
        .filter((pair: Record<string, string>) => pair.quote === filter)
        .filter(searchFilter)
        .map((pair: Record<string, string>) => {
          const { price = null } = tickerPrices[pair.pair] || {}
          const { percentChange = null } = assetRankings[pair.base] || {}

          return (
            <ListItem key={pair.pair} isFlex={true} $height={48} onClick={() => handleAssetClick(pair.base, pair.quote, AssetViews.TRADE)}
            >
              <FlexItem $pl={5} $pr={5}>
                {renderIconAsset(pair.base.toLowerCase())}
              </FlexItem>
              <FlexItem>
                <Text>{pair.base}/{pair.quote}</Text>
              </FlexItem>
              <FlexItem textAlign='right' flex={1}>
                {(price !== null) && <Text>
                  {filter === FilterValues.USDT ? formattedNum(price) : price}
                </Text>}
                {(percentChange !== null) && <Text textColor={getPercentColor(percentChange)}>{percentChange}%</Text>}
              </FlexItem>
            </ListItem>
          )
      })}
    </List>
  </>
}

function Events ({
  newsEvents = []
}: any) {
  return <List>
    {newsEvents.map((event: any) => (
      <ListItem $p={10} key={event.redirect_url}>
        <Text $fontSize={12} textColor='light'>{event.updated_at}</Text>
        <Text $fontSize={12}>{event.content}</Text>
        <Link $fontSize={12} $mt={5} inlineBlock={true} href={event.redirect_url} target='_blank'>{event.redirect_title}</Link>
      </ListItem>
    ))}
  </List>
}

// Utility functions
function renderIconAsset (key: string) {
  if (!(key in icons)) {
    return null
  }

  return (
    <>
      <img width={25} src={icons[key]} />
    </>
  )
}

function formattedNum (price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol'
  }).format(price)
}

// This is a temporary function only necessary for MVP
// Merges losers/gainers into one table
function transformLosersGainers ({ losers = [], gainers = [] }: Record<string, AssetRanking[]>): Record<string, AssetRanking> {
  const losersGainersMerged = [ ...losers, ...gainers ]
  return losersGainersMerged.reduce((mergedTable: object, asset: AssetRanking) => {
    let { pair: assetName, ...assetRanking } = asset
    assetName = assetName.split('_')[0]

    return {
      ...mergedTable,
      [assetName]: assetRanking
    }
  }, {})
}

function getPercentColor (percentChange: string) {
  const percentChangeNum = parseFloat(percentChange)
  return percentChangeNum === 0 ? 'light' : (percentChangeNum > 0 ? 'green' : 'red')
}

async function copyToClipboard (address: string) {
  try {
    await clipboardCopy(address)
  } catch (e) {
    console.log(`Could not copy address ${e.toString()}`)
  }
}
