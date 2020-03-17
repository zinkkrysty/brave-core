/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

import {
  Header,
  Content,
  Copy,
  ActionsWrapper,
  ConnectButton,
  DismissAction,
  WidgetWrapper,
  GenButton,
  ActionTray,
  ActionItem,
  DisconnectWrapper,
  DisconnectButton,
  DisconnectTitle,
  DisconnectCopy,
  InvalidTitle,
  InvalidCopy,
  InvalidWrapper,
  BuyPromptWrapper,
  FiatDropdown,
  FiatDropdownLabel,
  FiatInputWrapper,
  CaratDropdown,
  AssetDropdown,
  AssetDropdownLabel,
  ConnectPrompt,
  AssetItems,
  AssetItem,
  FiatInputField,
  NavigationBar,
  NavigationItem,
  SelectedView,
  ListItem,
  ListIcon,
  ListImg,
  SearchInput,
  ListLabel,
  AssetLabel,
  DetailIcons,
  AssetTicker,
  AssetQR,
  MemoInfo,
  MemoArea,
  DetailArea,
  DetailLabel,
  DetailInfo,
  CopyButton,
  BackArrow,
  ListInfo,
  TradeLabel,
  BTCValueLabel,
  OtherValueLabel,
  BTCSummary,
  BlurIcon,
  TickerLabel,
  Balance,
  Converted,
  BuySellHeader,
  AssetInfo,
  PairPrice,
  PairName,
  BuySellToggle,
  Switch,
  BuySellContent,
  AmountInput,
  AmountButton,
  AmountTextInput,
  PercentWrapper,
  Percent,
  ActionLabel,
  BuySellButton,
  AvailableLabel,
  ConvertInfoWrapper,
  ConvertInfoItem,
  ConvertValue,
  ConvertLabel,
  StyledEmoji
} from './style'
import {
  BinanceLogo,
  DisconnectIcon,
  ShowIcon,
  HideIcon
} from './assets/icons'

import createWidget from '../widget/index'
import { getLocale } from '../../../../common/locale'
import { CaratLeftIcon, CaratDownIcon } from 'brave-ui/components/icons'
import searchIcon from './assets/search-icon.png'
import bchIcon from './assets/bch.png'
import bnbIcon from './assets/bnb.png'
import btcIcon from './assets/btc.png'
import busdIcon from './assets/busd.png'
import ethIcon from './assets/eth.png'
import xrpIcon from './assets/xrp.png'
import partyIcon from './assets/party.png'
import { getUSDPrice } from '../../../binance-utils'

interface State {
  disconnectInProgress: boolean
  initialAsset: string,
  initialAmount: string,
  currenciesShowing: boolean,
  selectedView: string
  currentDepositSearch: string
  currentDepositAsset: string
  currentTradeSearch: string
  currentTradeAsset: string
  currentTradeAmount: string
  currentConvertAmount: string
  currentConvertFrom: string
  currentConvertTo: string
  insufficientFunds: boolean
  showConvertPreview: boolean
  convertSuccess: boolean
  isBuyView: boolean
}

interface Props {
  userAuthed: boolean
  authInProgress: boolean
  hideBalance: boolean
  btcBalanceValue: string
  validationInProgress: boolean
  accountBalances: Record<string, string>
  assetUSDValues: Record<string, string>
  assetBTCValues: Record<string, string>
  assetBTCVolumes: Record<string, string>
  btcPrice: string
  btcVolume: string
  binanceClientUrl: string
  onBuyCrypto: (coin: string, amount: string) => void
  onBinanceDetails: () => void
  onBinanceDeposit: () => void
  onBinanceTrade: () => void
  onSetHideBalance: (hide: boolean) => void
  onGenerateNewKey: () => void
  onBinanceBalances: (balances: Record<string, string>) => void
  onBinanceUserTLD: (userTLD: NewTab.BinanceTLD) => void
  onBinanceClientUrl: (clientUrl: string) => void
  onBTCUSDPrice: (value: string) => void
  onBTCUSDVolume: (volume: string) => void
  onAssetBTCVolume: (ticker: string, volume: string) => void
  onAssetUSDPrice: (ticker: string, price: string) => void
  onAssetBTCPrice: (ticker: string, price: string) => void
  onDisconnectBinance: () => void
  onConnectBinance: () => void
  onValidAuthCode: () => void
}

class Binance extends React.PureComponent<Props, State> {
  private currencies: string[]
  private currencyNames: Record<string, string>

  constructor (props: Props) {
    super(props)
    this.state = {
      disconnectInProgress: false,
      initialAsset: 'BTC',
      initialAmount: '',
      currenciesShowing: false,
      selectedView: 'deposit',
      currentDepositSearch: '',
      currentDepositAsset: '',
      currentTradeSearch: '',
      currentTradeAsset: '',
      currentTradeAmount: '',
      currentConvertAmount: '',
      currentConvertFrom: 'BTC',
      currentConvertTo: '',
      insufficientFunds: false,
      showConvertPreview: false,
      convertSuccess: false,
      isBuyView: true
    }
    this.currencies = [
      'BTC',
      'ETH',
      'XRP',
      'BNB',
      'BCH',
      'BUSD'      
    ]
    this.currencyNames =  {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'XRP': 'Ripple',
      'BNB': 'Binance Coin',
      'BCH': 'Bitcoin Cash',
      'BUSD': 'US Dollar'     
    }
  }

  componentDidMount () {
    if (this.props.userAuthed) {
      this.fetchBalance()
    }

    if (this.props.authInProgress) {
      this.checkForOauthCode()
    }

    chrome.binance.getUserTLD((userTLD: NewTab.BinanceTLD) => {
      this.props.onBinanceUserTLD(userTLD)
    })

    chrome.binance.getClientUrl((clientUrl: string) => {
      this.props.onBinanceClientUrl(clientUrl)
    })
  }

  componentDidUpdate (prevProps: Props) {
    if (!prevProps.userAuthed && this.props.userAuthed) {
      this.fetchBalance()
    }
  }

  checkForOauthCode = () => {
    const params = window.location.search
    const urlParams = new URLSearchParams(params)
    const authCode = urlParams.get('code')

    if (authCode) {
      chrome.binance.getAccessToken(authCode, (success: boolean) => {
        if (success) {
          this.props.onValidAuthCode()
        }
      })
    }
  }

  fetchBalance = () => {
    // To Do
  }

  disconnectBinance = () => {
    this.setState({
      disconnectInProgress: true
    })
  }

  connectBinance = () => {
    const { binanceClientUrl } = this.props
    window.open(binanceClientUrl, '_blank')
    this.props.onConnectBinance()
  }

  cancelDisconnect = () => {
    this.setState({
      disconnectInProgress: false
    })
  }

  finishDisconnect = () => {
    this.props.onDisconnectBinance()
    this.cancelDisconnect()
  }

  renderRoutes = () => {
    const { selectedView } = this.state
    const { userAuthed } = this.props

    if (userAuthed) {
      if (selectedView === 'buy') {
        return this.renderBuyView()
      }

      if (selectedView === 'convert') {
        return this.renderConvertView()
      }

      return this.renderAccountView()
    }

    return this.renderBuyView()
  }

  onSetHideBalance = () => {
    this.props.onSetHideBalance(
      !this.props.hideBalance
    )
  }

  setInitialAsset (asset: string) {
    this.setState({
      initialAsset: asset,
      currenciesShowing: false
    })
  }

  setSelectedView (view: string) {
    this.setState({
      selectedView: view
    })
  }

  setCurrentDepositAsset (asset: string) {
    this.setState({
      currentDepositAsset: asset
    })
  }

  setCurrentConvertAsset (asset: string) {
    this.setState({
      currentConvertTo: asset,
      currenciesShowing: false
    })
  }

  getAssetIcon (asset: string) {
    switch (asset) {
      case 'BTC':
        return btcIcon
      case 'ETH':
        return ethIcon
      case 'BCH':
        return bchIcon
      case 'BNB':
        return bnbIcon
      case 'BUSD':
        return busdIcon
      case 'XRP':
        return xrpIcon
      default:
        return null
    }
  }

  setIsBuyView (isBuyView: boolean) {
    this.setState({ isBuyView })
  }

  processConvert = () => {
    const { accountBalances } = this.props
    const { currentConvertAmount } = this.state

    if (parseInt(currentConvertAmount) > parseInt(accountBalances['BTC'])) {
      this.setState({ insufficientFunds: true })
    } else {
      // Temporary
      setTimeout(() => {
        this.setState({ convertSuccess: true })
      }, 1500)
    }
  }

  renderDisconnectView = () => {
    return (
      <DisconnectWrapper>
        <DisconnectTitle>
          {getLocale('binanceWidgetDisconnectTitle')}
        </DisconnectTitle>
        <DisconnectCopy>
          {getLocale('binanceWidgetDisconnectText')}
        </DisconnectCopy>
        <DisconnectButton onClick={this.finishDisconnect}>
          {getLocale('binanceWidgetDisconnectButton')}
        </DisconnectButton>
        <DismissAction onClick={this.cancelDisconnect}>
          {getLocale('binanceWidgetCancelText')}
        </DismissAction>
      </DisconnectWrapper>
    )
  }

  renderConvertSuccess = () => {
    const { currentConvertAmount, currentConvertFrom, currentConvertTo } = this.state

    return (
      <InvalidWrapper>
        <StyledEmoji>
          <img src={partyIcon} />
        </StyledEmoji>
        <InvalidTitle>
          {`You converted ${currentConvertAmount} BTC ${currentConvertFrom} to ${currentConvertTo}!`}
        </InvalidTitle>
        <ConnectButton isSmall={true} onClick={() => {
            this.setState({
              convertSuccess: false,
              showConvertPreview: false,
              selectedView: 'deposit'
            })
          }}>
            {'Continue'}
        </ConnectButton>
      </InvalidWrapper>
    )
  }

  renderUnableToConvertView = () => {
    return (
      <InvalidWrapper>
        <InvalidTitle>
          {'Unable to Convert'}
        </InvalidTitle>
        <InvalidCopy>
          {'The amount you entered exceeds the amount you currently have available'}
        </InvalidCopy>
        <GenButton onClick={() => {
          this.setState({
            insufficientFunds: false,
            showConvertPreview: false,
            currentConvertAmount: '',
            currentConvertTo: '',
            currentConvertFrom: ''
          })
        }}>
          {'Retry'}
        </GenButton>
      </InvalidWrapper>
    )    
  }

  renderCurrentDepositAsset = () => {
    const { currentDepositAsset } = this.state

    return (
      <>
        <ListItem>
          <DetailIcons>
            <BackArrow>
              <CaratLeftIcon onClick={() => {
                this.setCurrentDepositAsset.bind(this, '')
              }}/>
            </BackArrow>
            <ListImg src={this.getAssetIcon(currentDepositAsset)} />
          </DetailIcons>
          <AssetTicker>
            {currentDepositAsset}
          </AssetTicker>
          <AssetLabel>
            {`(${this.currencyNames[currentDepositAsset]})`}
          </AssetLabel>
          <AssetQR>
          </AssetQR>
        </ListItem>
        <DetailArea>
          <MemoArea>
            <MemoInfo>
              <DetailLabel>
                {`${currentDepositAsset} Memo`}
              </DetailLabel>
              <DetailInfo>
                {`XXXXXXX`}
              </DetailInfo>
            </MemoInfo>
            <CopyButton>
              {'Copy'}
            </CopyButton>
          </MemoArea>
          <MemoArea>
            <MemoInfo>
              <DetailLabel>
                {`${currentDepositAsset} Deposit Address`}
              </DetailLabel>
              <DetailInfo>
                {`XXXXXX`}
              </DetailInfo>
            </MemoInfo>
          </MemoArea>
        </DetailArea>
      </>   
    )
  }

  renderDepositView = () => {
    const { currencyNames } = this
    const { currentDepositSearch, currentDepositAsset } = this.state

    if (currentDepositAsset) {
      return this.renderCurrentDepositAsset()
    }

    return (
      <>
        <ListItem>
          <ListIcon>
          </ListIcon>
          <SearchInput
            type={'text'}
            placeholder={'Search'}
            onChange={({ target }) => {
              this.setState({ currentDepositSearch: target.value })
            }}
          />
        </ListItem>
        {this.currencies.map((asset: string) => {
          const cleanName = currencyNames[asset]
          const lowerAsset = asset.toLowerCase()
          const lowerName = cleanName.toLowerCase()
          const lowerSearch = currentDepositSearch.toLowerCase()

          if (lowerAsset.indexOf(lowerSearch) < 0 &&
              lowerName.indexOf(lowerSearch) < 0) {
            return null
          }

          return (
            <ListItem
              key={`list-${asset}`}
              onClick={this.setCurrentDepositAsset.bind(this, asset)}
            >
              <ListIcon>
                <ListImg src={this.getAssetIcon(asset)} />
              </ListIcon>
              <ListLabel>
                {`${asset} (${currencyNames[asset]})`}
              </ListLabel>
            </ListItem>
          )
        })}
      </>
    )
  }

  renderSummaryView = () => {
    const { accountBalances, btcBalanceValue, hideBalance } = this.props

    return (
      <>
        <BTCSummary>
          <ListInfo position={'left'}>
            <TradeLabel>
              <Balance isBTC={true} hideBalance={hideBalance}>
                {accountBalances['BTC']} <TickerLabel>{getLocale('binanceWidgetBTCTickerText')}</TickerLabel>
              </Balance>
              <Converted hideBalance={hideBalance}>
                {`= $${btcBalanceValue}`}
              </Converted>
            </TradeLabel>
          </ListInfo>
          <ListInfo position={'right'}>
            <TradeLabel>
              <BlurIcon onClick={this.onSetHideBalance}>
                {
                  hideBalance
                  ? <ShowIcon />
                  : <HideIcon />
                }
              </BlurIcon>
            </TradeLabel>
          </ListInfo>          
        </BTCSummary>
        {this.currencies.map((asset: string) => {
          return (
            <ListItem key={`list-${asset}`}>
              <ListInfo isAsset={true} position={'left'}>
                <ListIcon>
                  <ListImg src={this.getAssetIcon(asset)} />
                </ListIcon>
                <ListLabel>
                  {asset}
                </ListLabel>
              </ListInfo>
              <ListInfo position={'right'}>
                <Balance isBTC={false} hideBalance={hideBalance}>
                  {accountBalances[asset]}
                </Balance>
                <Converted isBTC={false} hideBalance={hideBalance}>
                  {`= $${btcBalanceValue}`}
                </Converted>                
              </ListInfo>
            </ListItem>
          )
        })}
      </>
    )
  }

  renderConvertConfirm = () => {
    const { currentConvertAmount, currentConvertTo } = this.state
    const receivedAmount = currentConvertAmount === '6' ? '0': '0'
    return (
      <InvalidWrapper>
        <InvalidTitle>
          {'Confirm Conversion'}
        </InvalidTitle>
        <ConvertInfoWrapper>
          <ConvertInfoItem>
            <ConvertLabel>{'Convert'}</ConvertLabel>
            <ConvertValue>{`${currentConvertAmount} BTC`}</ConvertValue>
          </ConvertInfoItem>
          <ConvertInfoItem>
            <ConvertLabel>{'Rate'}</ConvertLabel>
            <ConvertValue>{`1 BTC = X ${currentConvertTo}`}</ConvertValue>
          </ConvertInfoItem>
          <ConvertInfoItem>
            <ConvertLabel>{'Fee'}</ConvertLabel>
            <ConvertValue>{'0.0005 BNB'}</ConvertValue>
          </ConvertInfoItem>
          <ConvertInfoItem isLast={true}>
            <ConvertLabel>{'You will receive'}</ConvertLabel>
            <ConvertValue>{`${receivedAmount} ${currentConvertTo}`}</ConvertValue>
          </ConvertInfoItem>
        </ConvertInfoWrapper>
        <ActionsWrapper>
          <ConnectButton isSmall={true} onClick={this.processConvert}>
            {`Confirm`}
          </ConnectButton>
          <DismissAction onClick={() => {
            this.setState({
              currentConvertFrom: '',
              currentConvertTo: '',
              showConvertPreview: false
            })
          }}>
            {'Cancel'}
          </DismissAction>
        </ActionsWrapper>
      </InvalidWrapper>
    )   
  }

  renderConvertView = () => {
    const { accountBalances } = this.props
    const { currentConvertAmount, currentConvertTo } = this.state
  
    return (
      <>
        <Copy>
          {'Convert'}
        </Copy>
        <AvailableLabel>
          {`Available ${accountBalances['BTC']} BTC`}
        </AvailableLabel>
        <BuyPromptWrapper>
          <FiatInputWrapper>
            <FiatInputField
              type={'text'}
              placeholder={'I want to convert...'}
              value={currentConvertAmount}
              onChange={({ target }) => {
                this.setState({ currentConvertAmount: target.value })
              }}
            />
            <FiatDropdown>
              <FiatDropdownLabel>
                {'BTC'}
              </FiatDropdownLabel>
              <CaratDropdown>
                <CaratDownIcon />
              </CaratDropdown>
            </FiatDropdown>
          </FiatInputWrapper>
          <AssetDropdown
            itemsShowing={this.state.currenciesShowing}
            onClick={() => { this.setState({
              currenciesShowing: !this.state.currenciesShowing
            })}}
          >
            <AssetDropdownLabel>
              {currentConvertTo || 'BNB'}
            </AssetDropdownLabel>
            <CaratDropdown>
              <CaratDownIcon />
            </CaratDropdown>
          </AssetDropdown>
          {
            this.state.currenciesShowing
            ? <AssetItems>
                {this.currencies.map((asset: string, i: number) => {
                  if (asset === 'ETH' || asset == 'BNB') {
                    return null
                  }

                  return (
                    <AssetItem
                      key={`choice-${asset}`}
                      isLast={i === (this.currencies.length - 1)}
                      onClick={this.setCurrentConvertAsset.bind(this, asset)}
                    >
                      {asset}
                    </AssetItem>
                  )
                })}
              </AssetItems>
            : null
          }
        </BuyPromptWrapper>
        <ActionsWrapper>
          <ConnectButton onClick={() => {
            this.setState({
              showConvertPreview: true
            })
          }}>
            {`Preview Conversion`}
          </ConnectButton>
          <DismissAction onClick={this.setSelectedView.bind(this, 'deposit')}>
            {'Cancel'}
          </DismissAction>
        </ActionsWrapper>
      </>
    )
  }

  renderTradeView = () => {
    const { currencyNames } = this
    const { currentTradeSearch } = this.state
    const { accountBalances, btcPrice, btcVolume, btcBalanceValue, assetBTCValues, assetBTCVolumes } = this.props

    return (
      <>
        <ListItem>
          <ListIcon>
            <ListImg src={searchIcon} />
          </ListIcon>
          <SearchInput
            type={'text'}
            placeholder={'Search trading pairs'}
            onChange={({ target }) => {
              this.setState({ currentTradeSearch: target.value
            })}}
          />
        </ListItem>
        <ListItem
          onClick={() => { this.setState({
            currentTradeAsset: `BTC / USDT`
          })}}
        >
          <ListInfo position={'left'}>
            <TradeLabel>
              <span style={{ color: '#fff' }}>{'BTC'}</span>
              <span>{' / USDT'}</span>
            </TradeLabel>
            <TradeLabel>
              {`Vol ${btcVolume}`}
            </TradeLabel>
          </ListInfo>
          <ListInfo position={'right'}>
            <BTCValueLabel>
              {accountBalances['BTC']}
            </BTCValueLabel>
            <TradeLabel>
              {`$${btcBalanceValue}`}
            </TradeLabel>
          </ListInfo>          
        </ListItem>
        {Object.keys(assetBTCValues).map((pair: string) => {
          const lowerPair = pair.toLowerCase()
          const cleanName = currencyNames[pair].toLowerCase()
          const lowerSearch = currentTradeSearch.toLowerCase()

          if (lowerPair.indexOf(lowerSearch) < 0 &&
              cleanName.indexOf(lowerSearch) < 0) {
            return null
          }

          return (
            <ListItem
              key={`trade-${pair}`}
              style={{ cursor: 'pointer' }}
              onClick={() => { this.setState({
                currentTradeAsset: `${pair} / BTC`
              })}}
            >
              <ListInfo position={'left'}>
                <TradeLabel>
                  <span style={{ color: '#fff' }}>{pair}</span>
                  <span>{' / BTC'}</span>
                </TradeLabel>
                <TradeLabel>
                  {`Vol ${assetBTCVolumes[pair]}`}
                </TradeLabel>
              </ListInfo>
              <ListInfo position={'right'}>
                <OtherValueLabel>
                  {assetBTCValues[pair]}
                </OtherValueLabel>
                <TradeLabel>
                  {`$${getUSDPrice(assetBTCValues[pair], btcPrice)}`}
                </TradeLabel>
              </ListInfo>
            </ListItem>
          )
        })}
      </>
    )
  }

  renderBuySellView = () => {
    const { accountBalances, btcPrice } = this.props
    const { currentTradeAsset, isBuyView, currentTradeAmount } = this.state
    const BTCBalance = parseFloat(accountBalances['BTC'])
    const currentAmount = parseFloat(currentTradeAmount)

    return (
      <>
        <BuySellHeader>
          <AssetInfo>
            <PairName>
              {currentTradeAsset}
            </PairName>
            <PairPrice>
              {parseFloat(btcPrice).toFixed(4)}
            </PairPrice>
          </AssetInfo>
          <BuySellToggle>
            <Switch
              active={isBuyView}
              onClick={this.setIsBuyView.bind(this, true)}
            >
              {'Buy'}</Switch>
            <Switch
              active={!isBuyView}
              onClick={this.setIsBuyView.bind(this, false)}
            >
              {'Sell'}
            </Switch>
          </BuySellToggle>
        </BuySellHeader>
        <BuySellContent>
          <ActionLabel>
            {`${isBuyView ? 'Buy' : 'Sell'} @ Market Price`}
          </ActionLabel>
          <AmountInput>
            <AmountButton
              onClick={() => {
                this.setState({
                  currentTradeAmount: (currentAmount - 1).toString()
                })
              }}
            >
              {'-'}
            </AmountButton>
            <AmountTextInput
              type={'text'}
              placeholder={'Amount (BTC)'}
              value={currentTradeAmount}
              onChange={({ target }) => {
                this.setState({ currentTradeAmount: target.value })
              }}
            />
            <AmountButton
              onClick={() => {
                this.setState({
                  currentTradeAmount: (currentAmount + 1).toString()
                })
              }}
            >
              {'+'}
            </AmountButton>
          </AmountInput>
          <PercentWrapper>
            <Percent
              onClick={() => {
                this.setState({
                  currentTradeAmount: (BTCBalance * .25).toString()
                })
              }}
            >
              {'25%'}
            </Percent>
            <Percent
              onClick={() => {
                this.setState({
                  currentTradeAmount: (BTCBalance * .50).toString()
                })
              }}
            >
              {'50%'}
            </Percent>
            <Percent
              onClick={() => {
                this.setState({
                  currentTradeAmount: (BTCBalance * .75).toString()
                })
              }}
            >
              {'75%'}
            </Percent>
            <Percent
              onClick={() => {
                this.setState({
                  currentTradeAmount: BTCBalance.toString()
                })
              }}
            >
              {'100%'}
            </Percent>
          </PercentWrapper>
          <ActionLabel>
            {
              isBuyView
              ? `Available ${accountBalances['BUSD']} BUSD`
              : `Available ${accountBalances['BTC']} BTC`
            }
          </ActionLabel>
          <BuySellButton isBuy={isBuyView}>
            {`${isBuyView ? 'Buy' : 'Sell'}`}
          </BuySellButton>
          <DismissAction
            onClick={() => {
              this.setSelectedView.bind(this, 'convert')
              this.setState({ currentTradeAsset: '' })
            }}
          >
            {'Cancel'}
          </DismissAction>
        </BuySellContent>
      </>
    )
  }
  
  renderSelectedView = () => {
    const { selectedView } = this.state

    switch (selectedView) {
      case 'deposit':
        return this.renderDepositView()
      case 'summary':
        return this.renderSummaryView()
      default:
        return null
    }
  }

  renderAccountView = () => {
    const { selectedView } = this.state

    return (
      <>
        <NavigationBar>
          <NavigationItem
            isActive={selectedView === 'deposit'}
            onClick={this.setSelectedView.bind(this, 'deposit')}>
            {'Deposit'}
          </NavigationItem>
          <NavigationItem
            isActive={selectedView === 'convert'}
            onClick={this.setSelectedView.bind(this, 'convert')}>
            {'Convert'}
          </NavigationItem>
          <NavigationItem
            isActive={selectedView === 'summary'}
            onClick={this.setSelectedView.bind(this, 'summary')}>
            {'Summary'}
          </NavigationItem>
          <NavigationItem
            isActive={selectedView === 'buy'}
            onClick={this.setSelectedView.bind(this, 'buy')}>
            {'Buy'}
          </NavigationItem>
        </NavigationBar>
        <SelectedView>
          {this.renderSelectedView()}
        </SelectedView>
      </>
    )
  }

  renderBuyView = () => {
    const { onBuyCrypto } = this.props
    const { initialAsset, initialAmount, selectedView } = this.state
  
    return (
      <>
        <Copy>
          {'Buy Crypto'}
        </Copy>
        <BuyPromptWrapper>
          <FiatInputWrapper>
            <FiatInputField
              type={'text'}
              placeholder={'I want to spend...'}
              value={initialAmount}
              onChange={({ target }) => {
                this.setState({ initialAmount: target.value })
              }}
            />
            <FiatDropdown>
              <FiatDropdownLabel>
                {'USD'}
              </FiatDropdownLabel>
              <CaratDropdown>
                <CaratDownIcon />
              </CaratDropdown>
            </FiatDropdown>
          </FiatInputWrapper>
          <AssetDropdown
            itemsShowing={this.state.currenciesShowing}
            onClick={() => { this.setState({
              currenciesShowing: !this.state.currenciesShowing
            })}}
          >
            <AssetDropdownLabel>
              {this.state.initialAsset}
            </AssetDropdownLabel>
            <CaratDropdown>
              <CaratDownIcon />
            </CaratDropdown>
          </AssetDropdown>
          {
            this.state.currenciesShowing
            ? <AssetItems>
                {this.currencies.map((asset: string, i: number) => {
                  if (asset === initialAsset) {
                    return null
                  }

                  return (
                    <AssetItem
                      key={`choice-${asset}`}
                      isLast={i === (this.currencies.length - 1)}
                      onClick={this.setInitialAsset.bind(this, asset)}
                    >
                      {asset}
                    </AssetItem>
                  )
                })}
              </AssetItems>
            : null
          }
        </BuyPromptWrapper>
        <ActionsWrapper>
          <ConnectButton onClick={onBuyCrypto.bind(this, initialAsset, initialAmount)}>
            {`Buy ${initialAsset}`}
          </ConnectButton>
          {
            selectedView === 'buy'
            ? <DismissAction onClick={this.setSelectedView.bind(this, 'deposit')}>
                {'Cancel'}
              </DismissAction>
            : null
          }
        </ActionsWrapper>
      </>
    )
  }
  
  render () {
    const { currentTradeAsset, selectedView, showConvertPreview, insufficientFunds, convertSuccess } = this.state
    const { userAuthed, authInProgress } = this.props 

    if (currentTradeAsset) {
      return (
        <WidgetWrapper>
          {this.renderBuySellView()}
        </WidgetWrapper>
      )
    }

    if (insufficientFunds) {
      return (
        <WidgetWrapper>
          {this.renderUnableToConvertView()}
        </WidgetWrapper>
      )
    }

    if (convertSuccess) {
      return (
        <WidgetWrapper>
          {this.renderConvertSuccess()}
        </WidgetWrapper>
      )
    }

    if (showConvertPreview) {
      return (
        <WidgetWrapper>
          {this.renderConvertConfirm()}
        </WidgetWrapper>
      )
    }

    if (this.state.disconnectInProgress) {
      return (
        <WidgetWrapper>
          {this.renderDisconnectView()}
        </WidgetWrapper>
      )
    }

    return (
      <WidgetWrapper>
        <Header>
          <BinanceLogo />
          {
            userAuthed && selectedView !== 'buy' && selectedView !== 'convert'
            ? <ActionTray>
                <ActionItem onClick={this.disconnectBinance}>
                  <DisconnectIcon />
                </ActionItem>
              </ActionTray>
            : !userAuthed && !authInProgress
              ? <ConnectPrompt onClick={this.connectBinance}>
                  {'Connect'}
                </ConnectPrompt>
              : null
          }
        </Header>
        <Content>
          {this.renderRoutes()}
        </Content>
      </WidgetWrapper>
    )
  }
}

export const BinanceWidget = createWidget(Binance)
