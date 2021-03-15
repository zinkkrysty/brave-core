import * as React from 'react'

// Components
import {
	DividerLine,
	SelectAddress,
	ConnectBottomNav,
	ConnectHeader
} from '../'

// Styled Components
import {
	StyledWrapper,
	SelectAddressContainer,
	NewAccountTitle,
	SelectAddressScrollContainer
} from './style'

export interface WalletAccountType {
	id: string
	name: string
	address: string
}

export interface Props {
	siteURL: string
	accounts: WalletAccountType[]
	onSubmit: () => void
	onCancel: () => void
	actionButtonText: string
	selectAccount: (account: WalletAccountType) => void
	removeAccount: (account: WalletAccountType) => void
	selectedAccounts: WalletAccountType[]
}

export default class ConnectWithSite extends React.PureComponent<Props> {
	checkIsSelected = (account: WalletAccountType) => {
		return this.props.selectedAccounts.some((a) => a.id === account.id)
	}

	render() {
		const {
			onSubmit,
			onCancel,
			siteURL,
			accounts,
			actionButtonText,
			removeAccount,
			selectAccount
		} = this.props
		return (
			<StyledWrapper>
				<ConnectHeader detailText={siteURL} />
				<SelectAddressContainer>
					<NewAccountTitle>New Account</NewAccountTitle>
					<DividerLine />
					<SelectAddressScrollContainer>
						{accounts.map((account) => (
							<SelectAddress
								action={() =>
									this.checkIsSelected(account)
										? removeAccount(account)
										: selectAccount(account)
								}
								key={account.id}
								account={account}
								isSelected={this.checkIsSelected(account)}
							/>
						))}
					</SelectAddressScrollContainer>
					<DividerLine />
				</SelectAddressContainer>
				<ConnectBottomNav
					actionText={actionButtonText}
					onSubmit={onSubmit}
					onCancel={onCancel}
				/>
			</StyledWrapper>
		)
	}
}
