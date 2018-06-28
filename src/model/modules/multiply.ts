import { glsl } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from '../VideoModule';

export const inletKeys = {
	'a': 'a',
	'b': 'b',
};

const shaderSource = glsl`
	precision mediump float;

	uniform vec2 inputTextureDimensions;
	uniform sampler2D leftTexture;
	uniform sampler2D rightTexture;

	void main() {
		vec2 samplePoint =
			gl_FragCoord.xy / inputTextureDimensions;
		gl_FragColor =
			texture2D(leftTexture, samplePoint)
			* texture2D(rightTexture, samplePoint);
		gl_FragColor.rgb = fract(gl_FragColor.rgb);
	}
`;

// Multiplies two textures together, and takes the fractional component of the result.
export const multiply: VideoModule<ShaderModule> = {
	parameters: {
		keys: [],
		defaultValues: {},
	},

	inlets: {
		keys: [inletKeys.a, inletKeys.b],
		associatedParameters: {},
	},

	details: {
		type: 'shader',

		shaderSource,

		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}),

		parametersToUniforms: () => ({}),

		inletsToUniforms: {
			[inletKeys.a]: 'leftTexture',
			[inletKeys.b]: 'rightTexture',
		}
	}
};
