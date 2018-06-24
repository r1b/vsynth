/*
import { crosshatch } from './modules/crosshatch';
import { dither } from './modules/dither';
*/
import { rgbOffset } from './modules/rgbOffset';
import { scanlines } from './modules/scanlines';
import { oscillator } from './modules/oscillator';
import { identity } from './modules/identity';
import { constant } from './modules/constant';
import { autoOsc } from './modules/autoOsc';
import { addFract } from './modules/addFract';
import { phaseDelta } from './modules/phaseDelta';
import { mixer } from './modules/mixer';
/*
import { divide } from './modules/divide';
*/
import { VideoModule, ShaderModule, SubgraphModule } from './VideoModule';
import { VideoNode } from './SimpleVideoGraph';

	/*
export type ModuleType =
	"oscillator";
	"identity" | "oscillator" | "constant" | "mixer" | "scanlines"
	| "crosshatch" | "dither" | "rgbOffset" | "addFract"
	| "divide" | "phaseDelta";
	*/

export type SubgraphModuleType = 'autoOsc';
export type ShaderModuleType =
	'oscillator' | 'identity' | 'constant' | 'addFract'
	| 'phaseDelta' | 'mixer' | 'scanlines' | 'rgbOffset';

export type ModuleType = ShaderModuleType | SubgraphModuleType;

export const subgraphModules: Record<SubgraphModuleType, VideoModule<SubgraphModule>> = {
	autoOsc,
};

export const shaderModules: Record<ShaderModuleType, VideoModule<ShaderModule>> = {
	oscillator,
	identity,
	constant,
	addFract,
	phaseDelta,
	mixer,
	scanlines,
	rgbOffset,
};

export const moduleKeys: ModuleType[] = [
	'oscillator', 'identity', 'constant', 'addFract',
	'phaseDelta', 'autoOsc', 'mixer', 'scanlines',
	'rgbOffset',
];


	/*
const modules: Record<ModuleType, VideoModule> = {
	rgbOffset,
	dither,
	crosshatch,
	divide,
};
	*/

export function moduleForType(moduleType: ModuleType): VideoModule<ShaderModule | SubgraphModule> {
	if (shaderModules[moduleType] != null) {
		return shaderModules[moduleType];
	} else {
		return subgraphModules[moduleType];
	}
}


export function moduleForNode(node: VideoNode): VideoModule<ShaderModule | SubgraphModule> {
	if (node.nodeType === 'subgraph') {
		return subgraphModules[node.type];
	} else {
		return shaderModules[node.type];
	}
}

