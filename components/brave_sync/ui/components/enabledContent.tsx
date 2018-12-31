/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

// Components
import { Button } from 'brave-ui'
import { CloseCircleIcon } from 'brave-ui/components/icons'
import Table, { Cell, Row } from 'brave-ui/components/dataTables/table'
import { Toggle } from 'brave-ui/features/shields'

// Feature-specific components
import {
  Main,
  Title,
  Paragraph,
  SectionBlock,
  TableRowDevice,
  TableRowRemove,
  TableRowRemoveButton,
  TableRowToggleButton,
  TableGrid,
  TableButtonGrid,
  EnabledContent,
  SyncCard
} from 'brave-ui/features/sync'

// Modals
import RemoveDeviceModal from './modals/removeDevice'

// Utils
import { getLocale } from '../../../common/locale'

interface Props {
  syncData: Sync.State
  actions: any
}

interface State {
  removeDevice: boolean
  deviceToRemoveName: string | undefined
  deviceToRemoveId: string | undefined
}

export default class SyncEnabledContent extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      removeDevice: false,
      deviceToRemoveName: '',
      deviceToRemoveId: ''
    }
  }

  getDevicesRows = (devices?: any): Row[] | undefined => {
    if (!devices) {
      return
    }

    return devices.map((device: any): Row => {
      const cell: Row = {
        content: [
          { content: (
            <TableRowDevice>
              {device.name} {device.id === this.props.syncData.thisDeviceId ? getLocale('thisDevice') : null}
            </TableRowDevice>
          )},
          { content: device.lastActive },
          {
            content: (
              <TableRowRemoveButton
                data-id={device.id}
                data-name={device.name}
                onClick={this.onClickRemoveDeviceButton}
              >
                <CloseCircleIcon />
              </TableRowRemoveButton>
            )
          }
        ]
      }
      return cell
    })
  }

  get devicesHeader (): Cell[] {
    return [
      { content: <TableRowDevice>{getLocale('deviceName')}</TableRowDevice> },
      { content: getLocale('addedOn') },
      { content: <TableRowRemove>{getLocale('remove')}</TableRowRemove> }
    ]
  }

  get settingsHeader (): Cell[] {
    return [
      { content: <TableRowDevice>{getLocale('settings')}</TableRowDevice> },
      { content: '' }
    ]
  }

  get settingsRows (): Row[] {
    return [
      {
        content: [
          { content: getLocale('bookmarks') },
          { content: (
            <TableRowToggleButton>
            <Toggle
              id='bookmarks'
              size='large'
              checked={this.props.syncData.syncBookmarks}
              onChange={this.onSyncBookmarks}
            />
            </TableRowToggleButton>
          ) }
        ]
      }
    ]
  }

  onClickRemoveDeviceButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!event || !event.currentTarget || !event.currentTarget.dataset) {
      return
    }
    const target = event.currentTarget as HTMLButtonElement
    this.setState({
      deviceToRemoveName: target.dataset.name,
      deviceToRemoveId: target.dataset.id,
      removeDevice: !this.state.removeDevice
    })
  }

  onClickViewSyncCodeButton = () => {
    this.props.actions.maybeOpenSyncModal('viewSyncCode', true)
  }

  onClickAddDeviceButton = () => {
    this.props.actions.maybeOpenSyncModal('deviceType', true)
  }

  onClickResetSyncButton = () => {
    this.props.actions.maybeOpenSyncModal('resetSync', true)
  }

  onSyncBookmarks = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.actions.onSyncBookmarks(event.target.checked)
  }

  render () {
    const { actions, syncData } = this.props
    const { deviceToRemoveName, deviceToRemoveId } = this.state

    if (!syncData) {
      return null
    }

    return (
      <EnabledContent>
        <Main>
          {
            syncData.modalsOpen.removeDevice
              ? (
                <RemoveDeviceModal
                  deviceName={deviceToRemoveName}
                  deviceId={Number(deviceToRemoveId)}
                  actions={actions}
                />
              )
              : null
          }
          <SyncCard>
            <Title level={2}>{getLocale('braveSync')}</Title>
            <Paragraph>{getLocale('syncChainDevices')}</Paragraph>
            <SectionBlock>
              <TableGrid isDeviceTable={true}>
                <Table header={this.devicesHeader} rows={this.getDevicesRows(syncData.devices)}>
                  Device list is empty
                </Table>
                <TableButtonGrid>
                  <br />
                  <Button
                    level='secondary'
                    type='accent'
                    size='medium'
                    text={getLocale('viewSyncCode')}
                    onClick={this.onClickViewSyncCodeButton}
                  />
                  <Button
                    level='primary'
                    type='accent'
                    size='medium'
                    text={getLocale('addDevice')}
                    onClick={this.onClickAddDeviceButton}
                  />
                </TableButtonGrid>
              </TableGrid>
            </SectionBlock>
            <Title level={2}>{getLocale('settingsTitle')}</Title>
            <Paragraph>{getLocale('settingsDescription')}</Paragraph>
            <SectionBlock>
              <Table header={this.settingsHeader} rows={this.settingsRows} />
            </SectionBlock>
            <SectionBlock>
              <Button
                level='primary'
                type='accent'
                size='medium'
                text={getLocale('leaveSyncChain')}
                onClick={this.onClickResetSyncButton}
              />
            </SectionBlock>
          </SyncCard>
        </Main>
      </EnabledContent>
    )
  }
}
