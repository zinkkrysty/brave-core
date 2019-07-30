/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import './youtubedown'

import * as bluebird from 'bluebird'
global.Promise = bluebird

function promisifier (method: any) {
  // return a function
  return function promisified (...args: any[]) {
    // which returns a promise
    return new Promise((resolve: any) => {
      args.push(resolve)
      method.apply(this, args)
    })
  }
}

function promisifyAll (obj: object, list: string[]) {
  list.forEach(api => bluebird.promisifyAll(obj[api], { promisifier }))
}

// let chrome extension api support Promise
promisifyAll(chrome, [
  'browserAction',
  'tabs',
  'windows'
])

promisifyAll(chrome.storage, [
  'local'
])

bluebird.promisifyAll(chrome.braveShields, { promisifier })

require('./background/api')
require('./background/events')
require('./background/store')
if (chrome.test) {
  chrome.test.sendMessage('brave-extension-enabled')
}

chrome.bravePlaylists.isInitialized((init) => {
  if (init) {
    return
  }
  chrome.bravePlaylists.onInitialized.addListener(() => {
    console.log(" ###### playlist initialized ######")
    chrome.bravePlaylists.onDownloadRequested.addListener((url) => {
      console.log(" ##### download requested: " + url + " #####")
      const items: any[] = window.youtubedown_urls(url)
      const mediaFiles = items.map(item => { return { url: item.url, title: item.file } })
      console.log(JSON.stringify(mediaFiles))
      chrome.bravePlaylists.createPlaylist(
        {
          thumbnailUrl: "",
          playlistName: "Untitled",
          mediaFiles: mediaFiles
        }
      )
    })
  })
})
// Initialize playlist API
chrome.bravePlaylists.initialize()
