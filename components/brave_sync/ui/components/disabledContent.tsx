/* This Source Code Form is subject to the terms of the Mozilla Public
 * License. v. 2.0. If a copy of the MPL was not distributed with this file.
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

// Components
import { Button } from 'brave-ui'

// Component-specific components
import {
  Main,
  Title,
  DisabledContentButtonGrid,
  TableGrid,
  Paragraph,
  SyncCard,
  DisabledContent
} from 'brave-ui/features/sync'

// Icons
import { LoaderIcon } from 'brave-ui/components/icons'

import { SyncStartIcon } from 'brave-ui/features/sync/images'

// Utils
import { getLocale } from '../../../common/locale'

interface Props {
  syncData: Sync.State
  actions: any
}

interface State {
  willCreateNewSyncChain: boolean
}

export default class SyncDisabledContent extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = { willCreateNewSyncChain: false }
  }

  componentDidUpdate (prevProps: Props) {
    // creating the chain can take a while and the operation
    // resets all sync states so in this case set a loading indicator
    // until Sync is ready. once ready, open the proper modal
    if (
      this.state.willCreateNewSyncChain === true &&
      prevProps.syncData.thisDeviceName !==
      this.props.syncData.thisDeviceName
    ) {
      this.props.actions.maybeOpenSyncModal('deviceType', true)
      // modal is open, reset loading state
      this.setState({ willCreateNewSyncChain: false })
    }
  }

  onClickNewSyncChainButton = () => {
    // once user clicks "start a new sync chain", create the chain
    this.setState({ willCreateNewSyncChain: true })

    const { thisDeviceName } = this.props.syncData
    if (thisDeviceName === '') {
      this.props.actions.onSetupNewToSync('')
    }
  }

  onClickEnterSyncChainCodeButton = () => {
    this.props.actions.maybeOpenSyncModal('enterSyncCode', true)
  }

  render () {
    const { syncData } = this.props
    const { willCreateNewSyncChain } = this.state

    if (!syncData) {
      return null
    }

    return (
      <DisabledContent>
        <Main>
          <SyncCard>
            <TableGrid>
              <SyncStartIcon />
              <div>
                <Title level={2}>{getLocale('syncTitle')}</Title>
                <Paragraph>{getLocale('syncDescription')}</Paragraph>
                <DisabledContentButtonGrid>
                  <Button
                    level='primary'
                    type='accent'
                    onClick={this.onClickNewSyncChainButton}
                    text={getLocale('startSyncChain')}
                    disabled={willCreateNewSyncChain}
                    icon={{
                      position: 'after',
                      image: willCreateNewSyncChain && <LoaderIcon />
                    }}
                  />
                  <Button
                    level='secondary'
                    type='accent'
                    onClick={this.onClickEnterSyncChainCodeButton}
                    text={getLocale('enterSyncChainCode')}
                  />
                </DisabledContentButtonGrid>
              </div>
            </TableGrid>
          </SyncCard>
        </Main>
      </DisabledContent>
    )
  }
}
