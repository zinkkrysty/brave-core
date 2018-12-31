/* This Source Code Form is subject to the terms of the Mozilla Public
 * License. v. 2.0. If a copy of the MPL was not distributed with this file.
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

// Components
import { Button, Modal, TextAreaClipboard } from 'brave-ui'
import { LoaderIcon } from 'brave-ui/components/icons'

// Feature-specific components
import {
  ModalHeader,
  Title,
  Paragraph,
  ThreeColumnButtonGrid,
  Bold,
  Link
} from 'brave-ui/features/sync'

// Utils
import { getLocale } from '../../../../common/locale'

interface Props {
  syncData: Sync.State
  actions: any
}

export default class ViewSyncCodeModal extends React.PureComponent<Props, {}> {
  componentDidMount () {
    const { scanCode, deviceType } = this.props.syncData.modalsOpen
    if (scanCode) {
      this.props.actions.maybeOpenSyncModal('scanCode', false)
    }
    if (deviceType) {
      this.props.actions.maybeOpenSyncModal('deviceType', false)
    }
  }

  onClickUseCameraInsteadButton = () => {
    this.props.actions.maybeOpenSyncModal('scanCode', true)
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
    this.props.actions.maybeOpenSyncModal('viewSyncCode', false)
  }

  render () {
    const { syncData } = this.props

    return (
      <Modal id='viewSyncCodeModal' displayCloseButton={false} size='small'>
        <ModalHeader>
          <div>
            <Title level={1}>{getLocale('chainCode')}</Title>
            <Paragraph>
              {getLocale('chainCodeDescriptionPartial1')} <Bold>{getLocale('chainCodeDescriptionPartial2')}</Bold> {getLocale('chainCodeDescriptionPartial3')}
            </Paragraph>
          </div>
        </ModalHeader>
          {
            syncData.syncWords
            ? (
              <TextAreaClipboard
                copiedString={getLocale('copied')}
                wordCountString={getLocale('wordCount')}
                readOnly={true}
                defaultValue={syncData.syncWords}
              />
            )
            : null
          }
        <ThreeColumnButtonGrid>
          <div>
            <Link onClick={this.onDismissModal}>{getLocale('cancel')}</Link>
          </div>
          <div>
            <Button
              level='secondary'
              type='subtle'
              size='medium'
              onClick={this.onClickUseCameraInsteadButton}
              text={getLocale('qrCode')}
            />
          </div>
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
        </ThreeColumnButtonGrid>
      </Modal>
    )
  }
}
