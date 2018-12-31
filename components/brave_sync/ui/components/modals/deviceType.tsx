/* This Source Code Form is subject to the terms of the Mozilla Public
 * License. v. 2.0. If a copy of the MPL was not distributed with this file.
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

// Components
import { Modal } from 'brave-ui'

// Feature-specific components
import {
  Title,
  ModalHeader,
  ModalTitle,
  DeviceGrid,
  DeviceContainer,
  ModalSubTitle
} from 'brave-ui/features/sync'

// Utils
import { getLocale } from '../../../../common/locale'

// Images
import { SyncDesktopIcon, SyncMobileIcon } from 'brave-ui/features/sync/images'

interface Props {
  syncData: Sync.State
  actions: any
}

export default class DeviceTypeModal extends React.PureComponent<Props, {}> {
  onUserNoticedError = () => {
    this.props.actions.resetSyncSetupError()
  }

  onClickPhoneTabletButton = () => {
    this.props.actions.maybeOpenSyncModal('scanCode', true)
  }

  onClickComputerButton = () => {
    this.props.actions.maybeOpenSyncModal('viewSyncCode', true)
  }

  render () {
    const { syncData } = this.props

    if (!syncData.isSyncConfigured) {
      return null
    }

    return (
      <Modal id='deviceTypeModal' displayCloseButton={false} size='small'>
        <ModalHeader>
          <div>
            <ModalTitle level={1}>{getLocale('letsSync')}</ModalTitle>
            <ModalSubTitle>{getLocale('chooseDeviceType')}</ModalSubTitle>
          </div>
        </ModalHeader>
        <DeviceGrid>
          <DeviceContainer onClick={this.onClickPhoneTabletButton}>
            <SyncMobileIcon />
            <Title level={2}>{getLocale('phoneTablet')}</Title>
          </DeviceContainer>
          <DeviceContainer onClick={this.onClickComputerButton}>
          <SyncDesktopIcon />
          <Title level={2}>{getLocale('computer')}</Title>
          </DeviceContainer>
        </DeviceGrid>
      </Modal>
    )
  }
}
