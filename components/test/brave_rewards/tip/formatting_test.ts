/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  formatTokenAmount,
  formatExchangeAmount,
  formatLocaleTemplate
} from '../../../brave_rewards/resources/tip/lib/formatting'

describe('Rewards Tip Dialog - formatting', () => {

  describe('formatTokenAmount', () => {
    it('formats token values to 2 decimal places', () => {
      expect(formatTokenAmount(0)).toBe('0.00')
      expect(formatTokenAmount(1.333333)).toBe('1.33')
      expect(formatTokenAmount(10.55555)).toBe('10.56')
    })
  })

  describe('formatExchangeAmount', () => {
    it('formats exchange amounts with a rate and currency', () => {
      expect(formatExchangeAmount(1.222, .95)).toBe('1.16 USD')
    })
  })

  describe('formatLocaleTemplate', () => {
    it('replaces named tokens in text', () => {
      expect(
        formatLocaleTemplate('a {{a}} b {{ b}} c {{ c }} d', {
          a: '1',
          b: '2',
          c: '3'
        }))
        .toBe('a 1 b 2 c 3 d')
      expect(
        formatLocaleTemplate('a {{a}} b', {}))
        .toBe('a {{a}} b')
    })
  })

})
