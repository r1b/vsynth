precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

const float TWO_PI = 6.28318530718;

uniform vec2 inputTextureDimensions;
uniform vec2 reciprocalInputTextureDimensions;
uniform sampler2D rotationTheta;
uniform float rotationAmount;
uniform sampler2D phaseOffsetTexture;
uniform float phaseOffsetTextureAmount;


vec2 rotate(vec2 v, float a, vec2 center) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return center + m * (v - center);
}

void main() {
	float N_SCANLINES_RECIP = reciprocalInputTextureDimensions.y;

	vec2 textureSamplePoint =
		gl_FragCoord.xy * reciprocalInputTextureDimensions;

	float theta =
		sampleTex(rotationTheta, textureSamplePoint, TWO_PI * rotationAmount);

	float phaseOffsetFromTexture =
		sampleTex(phaseOffsetTexture, textureSamplePoint, phaseOffsetTextureAmount);

	vec2 position =
		rotate(
				gl_FragCoord.xy,
				theta,
				inputTextureDimensions * 0.5);

	highp vec2 uv =
		position * reciprocalInputTextureDimensions;

	gl_FragColor = vec4(
			vec3(
				fract(
					uv.x * N_SCANLINES_RECIP
					+ (uv.y - mod(uv.y, N_SCANLINES_RECIP))
					+ phaseOffsetFromTexture)
				),
			1.);
}
