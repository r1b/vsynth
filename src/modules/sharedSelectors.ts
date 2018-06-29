import { values, flatMap } from 'lodash';
import { createSelector, Selector } from 'reselect';
import * as Graph from '@davidisaaclee/graph';
import { State as RootState } from './index';
import { SimpleVideoGraph, VideoNode } from '../model/SimpleVideoGraph';
import { ModuleType } from '../model/Kit';
import { Inlet } from '../model/Inlet';
import { Outlet } from '../model/Outlet';
import { combinations } from '../utility/combinations';

const document =
	(state: RootState) => state.graph.present;

const nodes =
	createSelector(
		document,
		d => d.nodes);

export const busCount =
	createSelector(
		document,
		d => d.busCount);

export const inletConnections =
	createSelector(
		document,
		d => d.inletConnections);

export const outletConnections =
	createSelector(
		document,
		d => d.outletConnections);

export const nodeOrder =
	createSelector(
		document,
		d => d.nodeOrder);

export const nextNodeKey =
	createSelector(
		document,
		d => (modType: ModuleType) => `${modType}-${d.nodeKeySeed}`);

export const orderedNodes: Selector<RootState, Array<{ key: string, node: VideoNode }>> =
	createSelector(
		[nodes, nodeOrder],
		(nodes: Record<string, VideoNode>, nodeOrder: string[]) => (
			nodeOrder.map(key => ({
				key,
				node: nodes[key]
			}))
		));

const inletOutletLinks: Selector<RootState, Array<{ inlet: Inlet, outlet: Outlet }>> = createSelector(
	[inletConnections, outletConnections],
	(
		inletConnections: { [nodeKey: string]: { [inletKey: string]: number } },
		outletConnections: { [nodeKey: string]: number }
	) => {
		const connectionsByBus: { [busIndex: number]: { inlets: Inlet[], outlets: Outlet[] } } = {};

		function initializeBusIndexIfNeeded(busIndex: number) {
			if (connectionsByBus[busIndex] == null) {
				connectionsByBus[busIndex] = {
					inlets: [],
					outlets: []
				};
			}
		}

		for (const nodeKey of Object.keys(inletConnections)) {
			for (const inletKey of Object.keys(inletConnections[nodeKey])) {
				const busIndex = inletConnections[nodeKey][inletKey];
				initializeBusIndexIfNeeded(busIndex);
				connectionsByBus[busIndex].inlets
					.push({ nodeKey, inletKey });
			}
		}

		for (const nodeKey of Object.keys(outletConnections)) {
			const busIndex = outletConnections[nodeKey];
			initializeBusIndexIfNeeded(busIndex);
			connectionsByBus[busIndex].outlets
				.push({ nodeKey });
		}

		return flatMap(
			values(connectionsByBus),
			({ inlets, outlets }) => combinations(inlets, outlets))
			.map(([inlet, outlet]) => ({ inlet, outlet }));
	});


export const graph: Selector<RootState, SimpleVideoGraph> = createSelector(
	[
		orderedNodes,
		inletOutletLinks
	],
	(
		nodes: Array<{ key: string, node: VideoNode}>,
		inletOutletLinks: Array<{ inlet: Inlet, outlet: Outlet }>
	) => {
		let result = Graph.empty;
		result = nodes.reduce(
			(graph, { key, node }) => Graph.insertNode(graph, node, key),
			result);
		result = inletOutletLinks.reduce(
			(graph, { inlet, outlet }) => Graph.insertEdge(
				graph,
				{
					src: inlet.nodeKey,
					dst: outlet.nodeKey,
					metadata: { inlet: inlet.inletKey }
				},
				`${outlet.nodeKey} -> ${inlet.nodeKey}.${inlet.inletKey}`),
			result);
		return result;
	});

export const outputNodeKey =
	(state: RootState) => 'output';

