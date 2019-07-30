/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { bindActionCreators } from 'redux'

// Components
import App from './components/app'

// Utils
import store from './store'
import * as adblockActions from './actions/adblock_actions'

window.cr.define('brave_adblock', function () {
  'use strict'

  function getCustomFilters () {
    const actions = bindActionCreators(adblockActions, store.dispatch.bind(store))
    actions.getCustomFilters()
  }

  function getRegionalLists () {
    const actions = bindActionCreators(adblockActions, store.dispatch.bind(store))
    actions.getRegionalLists()
  }

  function initialize () {
    getCustomFilters()
    getRegionalLists()
    render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById('root'))
    window.i18nTemplate.process(window.document, window.loadTimeData)

    // playlist API demo

    // initialize Brave Playlists API
    chrome.bravePlaylists.initialize()

    chrome.bravePlaylists.isInitialized((init) => {
      if (init) {
        return
      }

      // wait for API initialization to complete before continuing
      chrome.bravePlaylists.onInitialized.addListener(() => {

        // listen for Playlist API events
        chrome.bravePlaylists.onPlaylistsChanged.addListener( (changeType, id) => {
          console.log(" ##### " + changeType + " " + id + " #####")
        })

        // request a download (will create a playlist if successful)
        chrome.bravePlaylists.requestDownload("https://www.youtube.com/watch?v=k8HoGzD4mWw")

//        // make a playlist with a short stock video
//        chrome.bravePlaylists.createPlaylist(
//          {
//            thumbnailUrl: "https://www.cutestockfootage.com/content/10501/thumb100.jpg",
//            playlistName: "Light Leaks Element 423",
//            mediaFiles: [
//              {
//                url: "https://www.cutestockfootage.com/content/10501/preview.mp4",
//                title: "Light Leaks Element 423"
//              }
//            ]
//          }
//        )
      })
    })
  }

  function onGetCustomFilters (customFilters: string) {
    const actions = bindActionCreators(adblockActions, store.dispatch.bind(store))
    actions.onGetCustomFilters(customFilters)
  }

  function onGetRegionalLists (regionalLists: AdBlock.FilterList[]) {
    const actions = bindActionCreators(adblockActions, store.dispatch.bind(store))
    actions.onGetRegionalLists(regionalLists)
  }

  function statsUpdated () {
    const actions = bindActionCreators(adblockActions, store.dispatch.bind(store))
    actions.statsUpdated()
  }

  return {
    initialize,
    onGetCustomFilters,
    onGetRegionalLists,
    statsUpdated
  }
})

document.addEventListener('DOMContentLoaded', window.brave_adblock.initialize)
