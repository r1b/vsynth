import { isEmpty } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as Modal from 'react-modal';
import { ActionCreators as UndoActions } from 'redux-undo';
import { HotKeys } from 'react-hotkeys';
import styled from '../../../styled-components';
import * as Kit from '../../../model/Kit';
import { videoModuleSpecFromModuleType } from '../../../model/SimpleVideoGraph';
import Screen from '../Screen';
import BusRouter from '../ConnectedBusRouter';
import ModulePicker from '../ModulePicker';
import SaveLoad from '../SaveLoad';
import MainMenu from '../MainMenu';
import * as AppModule from '../../../modules/app';
import * as Document from '../../../modules/document';
import * as sharedSelectors from '../../../modules/sharedSelectors';
import { State as RootState } from '../../../modules';

Modal.setAppElement('#root');

const e = React.createElement;

const StyledBusRouter = styled(BusRouter)`
	display: inline;
`;

const AddButton = styled.button`
	padding: 10px;

	border: 1px solid white;

	background-color: black;
	color: white;

	&:hover, &:active {
		background-color: #555;
	}
`;

const StyledMenu = styled(MainMenu)`
	position: fixed;
	right: 0;
	bottom: 0;
	
	margin: 20px 0;
`;

export interface Props {
	modal: AppModule.Modals.Modal | null;

	// Is the user currently changing a parameter?
	isPreviewingParameterChange: boolean;

	closeModal: () => any;
	addModule: (modType: Kit.ModuleType) => any;
	addBus: () => any;
	openNodePicker: () => any;
	undo: () => any;
	redo: () => any;
};

interface StateProps {
	modal: AppModule.Modals.Modal | null;
	nextNodeKey: (modType: Kit.ModuleType) => string;
	isPreviewingParameterChange: boolean;
}

interface DispatchProps {
	closeModal: () => any;
	makeAddModule: (makeNodeKey: (modType: Kit.ModuleType) => string) => (modType: Kit.ModuleType) => any;
	addBus: () => any;
	openNodePicker: () => any;
	undo: () => any;
	redo: () => any;
}

export interface State {
	isShowingRouter: boolean;
}

class Editor extends React.Component<Props, State> {
	public state = {
		isShowingRouter: true,
	}

	public renderModal(modal: AppModule.Modals.Modal): React.ReactNode {
		switch (modal.type) {
			case 'PICK_MODULE':
				return e(ModulePicker,
					{
						addModule: (modType: Kit.ModuleType) => {
							this.props.addModule(modType);
							this.props.closeModal();
						}
					});
			case 'SAVE_LOAD':
				return e(SaveLoad);
		}
	}

	public render() {
		const {
			modal,
			isPreviewingParameterChange,
			openNodePicker, closeModal,
			undo, redo,
			addBus
		} = this.props;
		const {
			isShowingRouter
		} = this.state;

		return e(HotKeys,
			{
				keyMap: {
					undo: ['command+z', 'ctrl+z'],
					redo: ['command+shift+z', 'ctrl+shift+z'],
				},
				handlers: {
					'undo': undo,
					'redo': redo
				},
				// TODO: This shouldn't be necessary, I think.
				attach: window,
			},
			e('div', {},
				e(Screen,
					{
						onClick: this.showMatrix
					}),
				e(Modal,
					{
						isOpen: isShowingRouter,
						onRequestClose: this.hideMatrix,
						style: {
							content: {
								opacity: isPreviewingParameterChange ? 0.2 : 1,
								backgroundColor: 'rgba(255, 255, 255, 0)',
								borderRadius: 0,
								border: 'none',
								outline: 'none',
								overflow: 'visible',
							},
							overlay: {
								backgroundColor: 'rgba(255, 255, 255, 0)',
								border: 'none',
							}
						}
					},
					e('div',
						{
							style: {
								left: 0,
								right: 0,
								top: 0,
								bottom: 0,
								position: 'absolute',
								overflow: 'auto',
							}
						},
						e('div',
							{
								style: {
									whiteSpace: 'nowrap'
								}
							},
							e(StyledBusRouter),
							e(AddButton,
								{
									onClick: addBus
								},
								'Add bus')),
						e(AddButton,
							{
								onClick: openNodePicker
							},
							'Add node')),
					e(StyledMenu)),
				e(Modal,
					{
						isOpen: modal != null,
						onRequestClose: closeModal,
						style: {
							content: {
								opacity: 1,
								backgroundColor: 'rgba(255, 255, 255, 0)',
								borderRadius: 0,
								border: '1px solid white',
								outline: '1px solid black',
							},
							overlay: {
								backgroundColor: 'rgba(255, 255, 255, 0)',
								border: 'none',
							}
						}
					},
					modal == null
					? null
					: this.renderModal(modal))));
	}

	private showMatrix = () => {
		this.setState({ isShowingRouter: true });
	}

	private hideMatrix = () => {
		this.setState({ isShowingRouter: false });
	}
}

function mapStateToProps(state: RootState): StateProps {
	return {
		modal: state.app.modal,
		nextNodeKey: sharedSelectors.nextNodeKey(state),
		isPreviewingParameterChange: !isEmpty(state.app.previewedParameterChanges),
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		makeAddModule: makeNodeKey => modType => {
			dispatch(Document.actions.insertNode(
				videoModuleSpecFromModuleType(modType),
				makeNodeKey(modType)));
		},
		closeModal: () => dispatch(AppModule.actions.setModal(null)),
		addBus: () => dispatch(Document.actions.addBus()),
		openNodePicker: () => dispatch(AppModule.actions.setModal(AppModule.Modals.pickModule)),
		undo: () => dispatch(UndoActions.undo()),
		redo: () => dispatch(UndoActions.redo()),
	};
}

interface OwnProps {};
function mergeProps(
	stateProps: StateProps,
	dispatchProps: DispatchProps,
	ownProps: OwnProps
): Props {
	const { nextNodeKey, ...restStateProps } = stateProps;
	const {
		makeAddModule,
		addBus, closeModal,
		openNodePicker, redo, undo
	} = dispatchProps;
	return {
		...restStateProps,
		addModule: makeAddModule(nextNodeKey),
		addBus,
		closeModal,
		openNodePicker,
		redo,
		undo
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps,
)(Editor);

