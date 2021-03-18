/* This Source Code Form is subject to the terms of the Mozilla Public
* License. v. 2.0. If a copy of the MPL was not distributed with this file.
* You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from 'styled-components'
interface StyleProps {
  as?: any
  $bg?: string
  breakWord?: boolean
  center?: boolean
  chartWidth?: number
  chartHeight?: number
  column?: boolean
  justify?: string
  alignItems?: string
  disabled?: boolean
  flex?: number
  $fontSize?: number
  hasBorder?: boolean
  hasBottomBorder?: boolean
  hasPadding?: boolean
  $hasSpacing?: boolean
  $height?: number
  hide?: boolean
  hideBalance?: boolean
  hideOverflow?: boolean
  href?: string
  inline?: boolean
  inlineBlock?: boolean
  isActive?: boolean
  isAsset?: boolean
  isAuth?: boolean
  isDeposit?: boolean
  isDetail?: boolean
  isFlex?: boolean
  isFullWidth?: boolean
  isLast?: boolean
  isSmall?: boolean
  isSummary?: boolean
  itemsShowing?: boolean
  light?: boolean
  lineHeight?: number | string
  $m?: number | string
  $mt?: number | string
  $mr?: number | string
  $mb?: number | string
  $ml?: number | string
  position?: string
  $p?: number | string
  $pt?: number | string
  $pr?: number | string
  $pb?: number | string
  $pl?: number | string
  showContent?: boolean
  small?: boolean
  large?: boolean
  style?: object
  tabIndex?: number
  textAlign?: string
  textColor?: string
  userAuthed?: boolean
  weight?: string | number
  marketView?: boolean
  upperCase?: boolean
  textOpacity?: number
  onClick?: Function
  onChange?: Function
}

function getTextStyle (p: StyleProps) {
  return [
    ["weight", `font-weight: ${p.weight || (p.small ? '500' : 'normal')};`],
    ["$fontSize", `font-size: ${(
        (p.$fontSize && `${p.$fontSize}px`) || (p.small ? '11px' : (p.large ? '19px' : '13px'))
    )};`],
    ["center", `text-align: ${p.center ? 'center' : 'inherit'};`],
    ["lineHeight", `line-height: ${p.lineHeight || 'normal'};]`]
  ].reduce((aggr, v) => {
    return p[v[0]] ? `${aggr}${v[1]}` : aggr
  }, '')
}

function getBoxStyle (p: StyleProps) {
  return [
    ['$p', `padding: ${typeof p.$p === 'number' ? `${p.$p}px` : p.$p};`],
    ['$pt', `padding-top: ${typeof p.$pt === 'number' ? `${p.$pt}px` : p.$pt};`],
    ['$pr', `padding-right: ${typeof p.$pr === 'number' ? `${p.$pr}px` : p.$pr};`],
    ['$pb', `padding-bottom: ${typeof p.$pb === 'number' ? `${p.$pb}px` : p.$pb};`],
    ['$pl', `padding-left: ${typeof p.$pl === 'number' ? `${p.$pl}px` : p.$pl};`],
    ['$m', `margin: ${typeof p.$m === 'number' ? `${p.$m}px` : p.$m};`],
    ['$mt', `margin-top: ${typeof p.$mt === 'number' ? `${p.$mt}px` : p.$mt};`],
    ['$mr', `margin-right: ${typeof p.$mr === 'number' ? `${p.$mr}px` : p.$mr};`],
    ['$mb', `margin-bottom: ${typeof p.$mb === 'number' ? `${p.$mb}px` : p.$mb};`],
    ['$ml', `margin-left: ${typeof p.$ml === 'number' ? `${p.$ml}px` : p.$ml};`],
    ['isFullWidth', 'width: 100%;']
  ].reduce((aggr, v) => {
    return p[v[0]] ? `${aggr}${v[1]}` : aggr
  }, '')
}

const colorNameToColor = {
  green: 'rgba(90, 186, 175, 1)',
  red: 'rgba(217, 134, 162, 1)',
  'red-bright': 'rgba(234, 78, 92, 1)',
  light: 'rgba(255, 255, 255, 0.6)',
  xlight: 'rgba(255, 255, 255, 0.3)'
}

function getColor (p: any) {
  let colorName;
  if (!/(string|undefined)/.test(typeof p)) {
    const keys = Object.keys(p)
    colorName = keys.find((key) => key in colorNameToColor)
  } else {
    colorName = p
  }
  return colorNameToColor[colorName]
}

export const Text = styled<StyleProps, 'p'>('p')`
  word-break: ${p => p.breakWord ? 'break-word' : 'normal'};
  color: ${p => getColor(p.textColor) || '#ffffff'};
  font-family: ${p => p.theme.fontFamily.heading};
  font-weight: ${p => (p.weight || (p.small ? '500' : 'normal'))};
  font-size: ${p => {
    return (p.$fontSize && `${p.$fontSize}px`) || (p.small ? '11px' : (p.large ? '19px' : '14px'))
  }};
  margin: ${p => (p.$hasSpacing ? '20px 0px' : '0px')};
  text-align: ${p => (p.center ? 'center' : 'inherit')};
  display: ${p => (p.inline ? 'inline-block' : 'block')};
  line-height: ${p => (p.lineHeight || 'normal')};
  filter: inherit;

  ${getBoxStyle}
`

export const BasicBox = styled<StyleProps, 'div'>('div')`
  display: ${p => (p.isFlex ? 'flex' : 'block')};
  ${(p) =>
    p.isFlex &&
    `
      flex-direction: ${p.column ? 'column' : 'row'};
      justify-content: ${p.justify || 'space-between'};
      align-items: ${p.alignItems || 'center'};
    `}

    ${getBoxStyle}
`

export const Box = styled<StyleProps>(BasicBox)`
  border: 1px solid rgba(79, 86, 97, 0.7);
  border-radius: 2px;
  ${p => p.hasBottomBorder === false && 'border-bottom: none;'}
  ${p => (!p.$p && p.$p !== 0) && 'padding: 0.5em;'}
  height: ${p => (p.$height ? `${p.$height}px` : 'auto')};
`

export const FlexItem = styled<StyleProps, 'div'>('div')`
  display: ${p => (p.isFlex ? 'flex' : 'block')};
  flex: ${p => p.flex || 'inherit'};
  text-align: ${p => p.textAlign || 'left'};
  padding: ${p => (p.hasPadding ? '0.5em' : '0px')};
  border-bottom: ${p => (p.hasPadding ? '1px solid rgba(79, 86, 97, 0.7)' : 'none')};

  ${(p) =>
    p.isFlex &&
    `
    flex-direction: ${p.column ? 'column' : 'row'};
    justify-content: space-between;
    align-items: center;
  `}

  ${getBoxStyle}
`

export const ButtonGroup = styled<StyleProps>(BasicBox)`
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  display: flex;
  justify-content: center;
  width: max-content;
  margin: 11px auto;
`

export const PlainButton = styled<StyleProps, 'button'>('button')`
  display: ${p => p.inline ? 'inline-block' : 'block'};
  background: none;
  border: none;
  cursor: ${p => p.disabled ? 'auto' : 'pointer'};
  color: ${p => getColor(p.textColor) || '#ffffff'};

  &:focus:not(:focus-visible) {
    outline: none;
  }

  ${getTextStyle}

  ${getBoxStyle}

  ${ButtonGroup} & {
    color: ${p => p.isActive
      ? p.theme.primary
      : getColor(p.textColor) || getColor('light')};
    font-weight: 500;
    text-transform: uppercase;
    border-right: 1px solid rgba(255, 255, 255, 0.2);

    &:last-child {
      border-right: none;
    }
  }
`

export const ActionButton = styled<StyleProps, 'button'>('button')`
  --textOpacity: ${p => p.textOpacity || 1};
  font-family: ${p => p.theme.fontFamily.heading};
  font-size: ${p => (p.small ? '13px' : '15px')};
  font-weight: ${p => (p.small ? '500' : 'bold')};
  border-radius: 20px;
  width: ${p => (p.inline ? 'auto' : (p.isFullWidth === false ? 'max-content' : '100%'))};
  background: ${p => getColor(p.$bg) || (p.light ? 'rgba(255, 255, 255, 0.21)' : p.theme.primary)};
  border: 0;
  padding: ${p => (p.small ? '6px 10px' : '10px 0px')};
  cursor: ${p => p.disabled ? 'auto' : 'pointer'};
  color: rgba(255, 255, 255, var(--textOpacity));
  line-height: 1;
  text-transform: ${p => !p.upperCase ? 'none' : 'uppercase'};

  ${getBoxStyle}
`

export const Link = styled<StyleProps, 'a'>('a')`
  ${p => p.inlineBlock && 'display: inline-block;'}
  color: ${p => p.textColor
    ? getColor(p.textColor) || getColor('light')
    : p.theme.primary};

  ${getTextStyle}
  ${getBoxStyle}
`

export const WidgetWrapper = styled<StyleProps, 'div'>('div')`
  color: white;
  padding: 6px 20px 13px 20px;
  border-radius: 6px;
  position: relative;
  font-family: ${p => p.theme.fontFamily.heading};
  font-size: 14px;
  overflow: hidden;
  min-width: 284px;
  background: ${p => p.theme.secondary};
  backdrop-filter: blur(16px);
`

export const Header = styled<StyleProps, 'div'>('div')`
  text-align: left;
  margin-bottom: ${p => (p.showContent ? '15' : '0')}px;
`

export const StyledTitle = styled<{}, 'div'>('div')`
  margin-top: 6px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  font-family: ${p => p.theme.fontFamily.heading};
`

export const WidgetIcon = styled<{}, 'div'>('div')`
  width: 27px;
  height: 27px;
  margin-right: 7px;
  margin-left: 2px;

  & svg,
  & img {
    width: 100%;
    height: 100%;
  }
`

export const StyledTitleText = styled<{}, 'div'>('div')``

export const List = styled<StyleProps>(Box)`
  overflow-y: ${p => (p.hideOverflow ? 'hidden' : 'scroll')};
  height: 260px;
  padding: 0;
  margin: 0;

  ${(p) =>
    (p.hasBorder === false) && `
    border: none;
  `}
`

export const ListItem = styled<StyleProps, 'li'>('li')`
  border-bottom: 1px solid rgba(79, 86, 97, 0.7);
  padding: ${p => (p.$p || 5)}px;
  border-radius: 2px;
  display: ${p => (p.isFlex ? 'flex' : 'block')};
  cursor: ${p => (p.onClick ? 'pointer' : 'initial')}
  height: ${p => (p.$height ? `${p.$height}px` : 'auto')};
  ${(p) =>
    p.isFlex && `
    justify-content: space-between;
    align-items: center;
  `};
`

export const BackArrow = styled<StyleProps>(PlainButton)`
  width: 20px;
  padding: 0;
  cursor: pointer;
  margin-left: ${p => p.marketView ? 60 : 0}px;
`

export const ActionAnchor = styled<StyleProps, 'a'>('a')`
  font-family: ${p => p.theme.fontFamily.heading};
  font-size: ${p => (p.small ? '13px' : '15px')};
  font-weight: ${p => (p.small ? '500' : 'bold')};
  border-radius: 20px;
  width: ${p => (p.inline ? 'auto' : '100%')};
  background: ${p => (p.light ? 'rgba(255, 255, 255, 0.21)' : p.theme.primary)};
  border: 0;
  padding: ${p => (p.small ? '6px 10px' : '10px 0px')};
  margin: 10px 0 15px;
  cursor: pointer;
  color: #ffffff;
  line-height: 1;
  display: block;
  text-align: center;
  text-decoration: none;
`

export const PlainAnchor = styled<StyleProps, 'a'>('a')`
  color: ${p => p.theme.primary};

  &:hover {
    opacity: 0.7;
  }
`

export const UpperCaseText = styled<StyleProps, 'span'>('span')`
  text-transform: uppercase;
`
export const SVG = styled<StyleProps, 'svg'>('svg')`
  margin: 1rem 0;
`

/**
* Dropdown styles
*/

export const InputWrapper = styled<StyleProps>(BasicBox)`
  height: 30px;
  color: #000;
  background: #fff;
  border: 1px solid white;
  padding: 5px 5px;
  cursor: pointer;
  border-bottom: ${p => p.itemsShowing ? 'none' : '1px solid white'};
  margin-top: 7px;
  position: relative;
`

export const InputField = styled<{}, 'input'>('input')`
  background: none;
  display: inline-block;
  min-width: 225px;
  border: 0;
  height: 30px;
  vertical-align: top;
  color: ${getColor('light')};
  padding-left: 5px;

  ${getBoxStyle}
`

export const AmountInputField = styled(InputField)`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-sizing: border-box;
  border-radius: 4px;
  color: ${getColor('light')};
`

export const Dropdown = styled<StyleProps, 'div'>('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #000;
  width: 30%;
  padding-left: 1rem;
  border-left: 1px solid #666767;
  cursor: ${p => p.disabled ? 'auto' : 'pointer'};
`

export const DropdownIcon = styled<StyleProps, 'span'>('span')`
  margin-right: 10px;
`

export const AssetDropdownLabel = styled<{}, 'span'>('span')`
  font-weight: bold;
`

export const CaratDropdown = styled<StyleProps, 'div'>('div')`
  margin-left: auto;
  width: 14px;
  height: 14px;
  color: rgba(94, 97, 117, 1);
  visibility: ${p => p.hide ? 'hidden' : 'visible'};
`

export const AssetItems = styled<StyleProps, 'div'>('div')`
  z-index: 1;
  background: #fff;
  color: #000;
  overflow-y: scroll;
  position: absolute;
  width: 244px;
  padding: 0px 5px;
  max-height: 80px;
  border: 1px solid white;
  border-top: none;
  height: 80px;
  left: -1px;
  right: 0;
  top: 100%;
`

export const AssetItem = styled<StyleProps, 'div'>('div')`
  padding: 3px 0px;
  font-weight: bold;
  cursor: pointer;
  border-bottom: ${p => !p.isLast ? '1px solid rgb(70, 70, 70, 0.2)' : ''};
`

export const TradeWrapper = styled<{}, 'div'>('div')`
  margin-bottom: 20px;
`

export const ActionsWrapper = styled<StyleProps, 'div'>('div')`
  margin-bottom: ${p => p.isAuth ? 20 : 5}px;
  text-align: center;
`

export const Balance = styled<StyleProps, 'span'>('span')`
  -webkit-filter: blur(${p => p.hideBalance ? 10 : 0}px);
`

export const BlurIcon = styled<{}, 'div'>('div')`
  cursor: pointer;
  color: rgb(70, 70, 70);
`

export const CryptoDotComIcon = styled<{}, 'div'>('div')`
width: 27px;
height: 27px;
margin-right: 7px;
margin-left: 2px;

& svg {
  width: 100%;
  height: 100%;
}
`

export const GenButton = styled<{}, 'button'>('button')`
  font-size: 13px;
  font-weight: bold;
  border-radius: 20px;
  border: 0;
  padding: 5px 10px;
  cursor: pointer;
  background: #2C2C2B;
  color: rgba(255, 255, 255, 0.7);
`

export const DisconnectButton = styled(GenButton)`
  background: #AA1212;
  color: #fff;
  padding: 5px 20px;
`

export const DisconnectWrapper = styled<{}, 'div'>('div')`
  padding-top: 75px;
  min-height: 250px;
  text-align: center;
  max-width: 240px;
`

export const Title = styled<{}, 'span'>('span')`
  display: block;
  font-size: 13px;
  font-weight: bold;
`

export const Copy = styled<{}, 'p'>('p')`
  font-size: 15px;
  max-width: 240px;
  margin-top: 20px;
  margin-bottom: 11px;
`

export const DisconnectTitle = styled(Title)`
  font-size: 14px;
  max-width: 245px;
  margin: 0 auto;
  line-height: 18px;
`

export const DisconnectCopy = styled(Copy)`
  color: #fff;
  max-width: 220px;
  line-height: 17px;
  margin: 8px auto 15px auto;
`

export const DismissAction = styled<{}, 'span'>('span')`
  display: block;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-top: 20px;
  font-weight: bold;
`
