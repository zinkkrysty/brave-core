/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

// Component groups
import DisabledContent from './disabledContent'
import EnabledContent from './enabledContent'

// Modals
import DeviceTypeModal from './modals/deviceType'
import EnterSyncCodeModal from './modals/enterSyncCode'
import ScanCodeModal from './modals/scanCode'
import ViewSyncCodeModal from './modals/viewSyncCode'
import ResetSyncModal from './modals/resetSync'

// Error alerts
import InitFailedDialog from './errorDialogs/initFailed'
import MissingWordsDialog from './errorDialogs/missingWords'
import NoInternetDialog from './errorDialogs/noInternet'
import WrongWordsDialog from './errorDialogs/wrongWords'

// Utils
import * as syncActions from '../actions/sync_actions'

// Assets
require('../../../fonts/muli.css')
require('../../../fonts/poppins.css')
require('emptykit.css')

interface Props {
  syncData: Sync.State
  actions: any
}

export class SyncPage extends React.PureComponent<Props, {}> {
  componentDidMount () {
    // Inform the back-end that Sync can be loaded
    this.props.actions.onPageLoaded()
  }

  onUserNoticedError = () => {
    this.props.actions.clearSyncSetupError()
  }

  render () {
    const { syncData, actions } = this.props

    if (!syncData) {
      return null
    }

    return (
      <div id='syncPage'>
        {
           syncData.error === 'ERR_SYNC_WRONG_WORDS' &&
           <WrongWordsDialog onUserNoticedError={this.onUserNoticedError} />
        }
        {
           syncData.error === 'ERR_SYNC_MISSING_WORDS' &&
           <MissingWordsDialog onUserNoticedError={this.onUserNoticedError} />
        }
        {
           syncData.error === 'ERR_SYNC_NO_INTERNET' &&
           <NoInternetDialog onUserNoticedError={this.onUserNoticedError} />
        }
        {
          syncData.error === 'ERR_SYNC_INIT_FAILED' &&
          <InitFailedDialog onUserNoticedError={this.onUserNoticedError} />
        }
        {
          syncData.modalsOpen.deviceType &&
          <DeviceTypeModal syncData={syncData} actions={actions} />
        }
        {
          syncData.modalsOpen.enterSyncCode &&
          <EnterSyncCodeModal syncData={syncData} actions={actions} />
        }
        {
          syncData.modalsOpen.scanCode &&
          <ScanCodeModal syncData={syncData} actions={actions} />
        }
        {
          syncData.modalsOpen.viewSyncCode &&
          <ViewSyncCodeModal syncData={syncData} actions={actions} />
        }
        {
          syncData.modalsOpen.resetSync &&
          <ResetSyncModal syncData={syncData} actions={actions} />
        }
        {
          syncData.isSyncConfigured && syncData.devices.length > 1
            ? <EnabledContent syncData={syncData} actions={actions} />
            : <DisabledContent syncData={syncData} actions={actions} />
        }
      </div>
    )
  }
}

export const mapStateToProps = (state: Sync.ApplicationState) => ({
  syncData: state.syncData
})

export const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(syncActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SyncPage)
