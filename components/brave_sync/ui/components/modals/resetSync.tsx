/* This Source Code Form is subject to the terms of the Mozilla Public
 * License. v. 2.0. If a copy of the MPL was not distributed with this file.
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

// Components
import { AlertBox, Button, Modal } from 'brave-ui'

// Feature-specific components
import {
  ModalHeader,
  ModalTitle,
  ModalSubTitle,
  ModalContent,
  TwoColumnButtonGrid,
  OneColumnButtonGrid,
  Title,
  Paragraph
} from 'brave-ui/features/sync'

// Utils
import { getLocale } from '../../../../common/locale'

interface Props {
  syncData: Sync.State
  actions: any
}

interface State {
  showAlert: boolean
}

export default class ResetSyncModal extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = { showAlert: false }
  }

  onClickResetSync = () => {
    this.setState({ showAlert: !this.state.showAlert })
  }

  onConfirmResetSync = () => {
    this.props.actions.onSyncReset()
  }

  onDismissModal = () => {
    this.props.actions.maybeOpenSyncModal('resetSync', false)
  }

  render () {
    const { syncData } = this.props
    const { showAlert } = this.state

    if (!syncData) {
      return null
    }

    return (
      <Modal id='resetSyncModal' displayCloseButton={false} size='small'>
        {
          showAlert
          ? (
              <AlertBox
                okString={getLocale('ok')}
                onClickOk={this.onConfirmResetSync}
                cancelString={getLocale('cancel')}
                onClickCancel={this.onClickResetSync}
              >
                <Title level={1}>{getLocale('areYouSure')}</Title>
              </AlertBox>
            )
          : null
        }
        <ModalHeader>
          <div>
            <ModalSubTitle highlight={true}>{getLocale('warning')}</ModalSubTitle>
            <ModalTitle level={1}>{getLocale('removing')} “{syncData.thisDeviceName}” {getLocale('deleteSyncChain')}</ModalTitle>
          </div>
        </ModalHeader>
        <ModalContent>
          <Paragraph>{getLocale('deleteSyncDescription')}</Paragraph>
          <Paragraph>{getLocale('startSyncChainHowTo')}</Paragraph>
        </ModalContent>
        <TwoColumnButtonGrid>
            <OneColumnButtonGrid>
              <Button
                level='secondary'
                type='accent'
                size='medium'
                onClick={this.onDismissModal}
                text={getLocale('cancel')}
              />
            </OneColumnButtonGrid>
            <Button
              level='primary'
              type='accent'
              size='medium'
              onClick={this.onClickResetSync}
              text={getLocale('remove')}
            />
          </TwoColumnButtonGrid>
      </Modal>
    )
  }
}
