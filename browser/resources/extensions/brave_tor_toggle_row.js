/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Polymer, html} from 'chrome://resources/polymer/v3_0/polymer/polymer_bundled.min.js'
import 'chrome://resources/cr_elements/shared_style_css.m.js'
import 'chrome://resources/js/cr.m.js'
import {I18nBehavior} from 'chrome://resources/js/i18n_behavior.m.js';
import './toggle_row.js';

Polymer({
  is: 'extensions-brave-tor-toggle-row',

  _template: html`{__html_template__}`,

  behaviors: [I18nBehavior],

  properties: {
    /**
     * The underlying ExtensionInfo for the details being displayed.
     * @type {!chrome.developerPrivate.ExtensionInfo}
     */
    data: Object,

    /** @type {!ItemDelegate} */
    delegate: Object,
  },

  onAllowTorChange_: function() {
    this.delegate.setItemAllowedTor(
        this.data.id, this.$$('#allow-tor').checked);
  },
});
