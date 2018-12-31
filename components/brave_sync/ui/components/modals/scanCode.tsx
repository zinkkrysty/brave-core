/* This Source Code Form is subject to the terms of the Mozilla Public
 * License. v. 2.0. If a copy of the MPL was not distributed with this file.
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

// Components
import { Button, Modal } from 'brave-ui'
import { LoaderIcon } from 'brave-ui/components/icons'

// Feature-specific components
import {
  ModalHeader,
  Title,
  Bold,
  Paragraph,
  ScanGrid,
  ThreeColumnButtonGrid,
  Link
} from 'brave-ui/features/sync'

// Utils
import { getLocale } from '../../../../common/locale'

// Images
import { SyncMobilePicture, QRCode } from 'brave-ui/features/sync/images'

interface Props {
  syncData: Sync.State
  actions: any
}

export default class ScanCodeModal extends React.PureComponent<Props, {}> {
  componentDidMount () {
    const { scanCode, deviceType } = this.props.syncData.modalsOpen
    if (scanCode) {
      this.props.actions.maybeOpenSyncModal('viewSyncCode', false)
    }
    if (deviceType) {
      this.props.actions.maybeOpenSyncModal('deviceType', false)
    }
  }

  onClickEnterCodeWordsInstead = () => {
    this.props.actions.maybeOpenSyncModal('viewSyncCode', true)
  }

  onDismissModal = () => {
    const { devices, isSyncConfigured } = this.props.syncData
    // sync is enabled when at least 2 devices are in the chain.
    // this modal works both with sync enabled and disabled states.
    // in case user opens it in the enabled content screen,
    // check there are 2 devices in chain before reset
    if (isSyncConfigured && devices.length < 2) {
      this.props.actions.onSyncReset()
    }
    this.props.actions.maybeOpenSyncModal('scanCode', false)
  }

  render () {
    const { syncData } = this.props

    return (
      <Modal id='scanCodeModal' displayCloseButton={false} size='small'>
        <ModalHeader>
          <div>
            <Title level={1}>{getLocale('scanThisCode')}</Title>
            <Paragraph>
              {getLocale('scanThisCodeHowToPartial1')} <Bold>{getLocale('scanThisCodeHowToPartial2')}</Bold> {getLocale('scanThisCodeHowToPartial3')}
            </Paragraph>
          </div>
        </ModalHeader>
        <ScanGrid>
          <div><SyncMobilePicture /></div>
          {
            syncData.seedQRImageSource
              ? <QRCode size='normal' src={syncData.seedQRImageSource} />
              : null
          }
        </ScanGrid>
        <ThreeColumnButtonGrid>
        <div>
            <Link onClick={this.onDismissModal}>{getLocale('cancel')}</Link>
          </div>
          <div>
            <Button
              level='secondary'
              type='subtle'
              size='medium'
              onClick={this.onClickEnterCodeWordsInstead}
              text={getLocale('viewSyncCode')}
            />
          </div>
          <div>
            <Button
              level='primary'
              type='accent'
              size='medium'
              onClick={this.onDismissModal}
              disabled={syncData.devices.length < 2}
              text={
                syncData.devices.length < 2
                ? getLocale('lookingForDevice')
                : getLocale('ok')
              }
              icon={{
                position: 'before',
                image: syncData.devices.length < 2
                  ? <LoaderIcon />
                  : null
              }}
            />
          </div>
        </ThreeColumnButtonGrid>
      </Modal>
    )
  }
}
