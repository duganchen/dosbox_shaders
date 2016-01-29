#version 330 core

const float SCANLINE_BASE_BRIGHTNESS = 0.95;
const float SCANLINE_SINE_COMP_A = 0.05;
const float SCANLINE_SINE_COMP_B = 0.15;

in vec2 tex;
uniform sampler2D s0;

in sine_coord
{
	vec2 omega;
} co;

out vec4 color;

void main()
{
	vec2 sine_comp = vec2(SCANLINE_SINE_COMP_A, SCANLINE_SINE_COMP_B);
	vec3 res = texture(s0, tex).xyz;
	vec3 scanline = res * (SCANLINE_BASE_BRIGHTNESS + dot(sine_comp * sin(tex * co.omega), vec2(1.0, 1.0)));
	color = vec4(scanline.x, scanline.y, scanline.z, 1.0);
}
