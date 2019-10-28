/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

// Components
import { AdBlockItemList } from './adBlockItemList'
import { CustomFilters } from './customFilters'
import { NumBlockedStat } from './numBlockedStat'

// Utils
import * as adblockActions from '../actions/adblock_actions'

// TODO cezaraugusto methods used here should exported and not bound to the window obj
import '../vendor/youtubedown'

interface Props {
  actions: any
  adblockData: AdBlock.State
}

export class AdblockPage extends React.Component<Props, {}> {
  constructor (props: Props) {
    super(props)
  }

  get actions () {
    return this.props.actions
  }

  get video () {
    return {
      muffinTime: 'https://www.youtube.com/watch?v=LACbVhgtx9I',
      uShouldBeDancing: 'https://www.youtube.com/watch?v=xI68A-rntIk',
      babyShark: 'https://www.youtube.com/watch?v=020g-0hhCAU',
      paleBlueDot: 'https://www.youtube.com/watch?v=wupToqz1e2g'
    }
  }

  componentDidMount () {
    chrome.bravePlaylists.initialize()

    chrome.bravePlaylists.isInitialized((init) => {
      if (init) {
        return
      }
      chrome.bravePlaylists.onInitialized.addListener(() => {
        console.log(' ###### playlist initialized ######')

        // chrome.bravePlaylists.deleteAllPlaylists((deleted: boolean) => {
        //   console.log(' ##### all playlists deleted #####')
        // })

        chrome.bravePlaylists.onDownloadRequested.addListener((url) => {
          console.log(' ##### playlist download requested: ' + url + ' #####')
          const ytdItems: chrome.bravePlaylists.YTDMediaItem[] = window.youtubedown_urls(url)
          if (ytdItems.length == 0) {
            console.log(' ##### got nothing from youtubedown_urls #####')
            return
          }
          const videoMediaFiles: chrome.bravePlaylists.CreateParamsMediaItem[] = this.makeMediaItems(ytdItems[0])
          let audioMediaFiles: chrome.bravePlaylists.CreateParamsMediaItem[] = []
          if (ytdItems.length > 1) {
            // Video is only available as separate video and audio files.
            // First item is always the video. Second item is always the audio.
            audioMediaFiles = this.makeMediaItems(ytdItems[1])
          }
          console.log(JSON.stringify(videoMediaFiles))
          console.log(JSON.stringify(audioMediaFiles))
          chrome.bravePlaylists.createPlaylist(
            {
              thumbnailUrl: '',
              playlistName: 'Untitled-1',
              videoMediaFiles,
              audioMediaFiles
            }
          )
        })
      })
    })
  }

  requestVideoDownload = (video: string) => {
    chrome.bravePlaylists.requestDownload(video)
  }

  makeMediaItems = (item: chrome.bravePlaylists.YTDMediaItem) => {
    let mediaFiles: chrome.bravePlaylists.CreateParamsMediaItem[]
    if (typeof item.url === 'string') {
      // Video is all in one file, but we'll pretend it's an array of 1 segment
      mediaFiles = [{ url: item.url, title: item.file }]
    } else {
      // Video is split into segments, which we will concatenate later
      const urls: string[] = item.url
      mediaFiles = urls.map(
        segment => {
          return { url: segment, title: item.file }
        })
    }
    return mediaFiles
  }

  render () {
    const { actions, adblockData } = this.props
    return (
      <div id='adblockPage'>
        <h1>Hello this is the Brave Playlists feature</h1>
        <ol>
          <li>
            <div style={{ display: 'none' }}>first video</div>
            <span>Muffin Time</span>
            <button
              onClick={this.requestVideoDownload.bind(this, this.video.muffinTime)}
            >
              download me
            </button>
          </li>
          <li>
            <div>second video</div>
          </li>
          <li>
            <div>third video</div>
          </li>
          <li>
            <div>fourth video</div>
          </li>
        </ol>
        <hr />
        <NumBlockedStat adsBlockedStat={adblockData.stats.adsBlockedStat || 0} />
        <AdBlockItemList
          actions={actions}
          resources={adblockData.settings.regionalLists}
        />
        <CustomFilters
          actions={actions}
          rules={adblockData.settings.customFilters || ''}
        />
      </div>
    )
  }
}

export const mapStateToProps = (state: AdBlock.ApplicationState) => ({
  adblockData: state.adblockData
})

export const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(adblockActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdblockPage)
