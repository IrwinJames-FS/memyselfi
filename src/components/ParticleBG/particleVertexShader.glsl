uniform float uTime;

// Source: https://github.com/dmnsgn/glsl-rotate/blob/main/rotation-3d-y.glsl.js
mat3 rotation3dY(float angle) {
	float s = sin(angle);
	float c = cos(angle);
	return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}
//https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main () {
	float rd = 2.0 - ((0.5 + sin(uTime * 1.0 * 3.14159 / 20.0) + 0.5) * 2.0);
	float d = (uTime*4.0) + dot(position, position) * 10.0;
	float s = sin(d);
	float c = cos(d);
	float t = (sin(uTime * 1.0 * 3.14159 / 1.0) * 0.01);
	vec3 particlePosition = position + vec3(
		s * t,
		c * t,
		s * t
	);
	vec3 scaledPosition = particlePosition * rd;
	vec4 modelPosition = modelMatrix * vec4(scaledPosition, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	gl_Position = projectedPosition;
	gl_PointSize = 3.0;
}