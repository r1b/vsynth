import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as Modal from 'react-modal';
import { VideoModule } from './model/Kit';
import Screen from './components/container/Screen';
import RoutingMatrix from './components/container/RoutingMatrix';
import ModulePicker from './components/container/ModulePicker';
import * as AppModule from './modules/app';
import * as Graph from './modules/graph';
import './App.css';
import { State as RootState } from './modules';

Modal.setAppElement('#root');

const e = React.createElement;

type Props = StateProps & DispatchProps;

class App extends React.Component<Props, object> {

	private gl: WebGLRenderingContext | null = null;

	public renderModal(modal: AppModule.Modals.Modal): React.ReactNode {
		if (modal === AppModule.Modals.PICK_MODULE) {
			return e(ModulePicker,
				{
					addModule: (mod: VideoModule) => {
						if (this.gl != null) {
							this.props.addModule(mod, this.gl);
							this.props.closeModal();
						}
					}
				});
		} else {
			throw new Error(`Invalid modal type: ${modal}`);
		}
	}
	
	public render() {
		return e('div',
			{},
			e(Screen,
				{
					glRef: (gl: WebGLRenderingContext | null) => {
						this.gl = gl;
					}
				}),
			e(RoutingMatrix, {
				style: {
					left: 0,
					top: 0,
					position: 'fixed',
					opacity: 0.5
				}
			}),
			e(Modal,
				{
					isOpen: this.props.modal != null,
					onRequestClose: this.props.closeModal,
				},
				this.props.modal == null
				? null
				: this.renderModal(this.props.modal))
		);
	}
}

interface StateProps {
	modal: AppModule.Modals.Modal | null;
}

interface DispatchProps {
	closeModal: () => any;
	addModule: (mod: VideoModule, gl: WebGLRenderingContext) => any;
}

function mapStateToProps(state: RootState): StateProps {
	return {
		modal: state.app.modal
	};
}

let counter = 0;
function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		closeModal: () => dispatch(AppModule.actions.setModal(null)),
		addModule: (mod, gl) => dispatch(Graph.actions.insertNode({
			type: mod.type,
			uniforms: mod.defaultUniforms == null
			? {}
			: mod.defaultUniforms(gl),
		}, `${mod.type}-${counter++}`))
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);

