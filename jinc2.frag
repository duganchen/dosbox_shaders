#version 330 core

const float JINC2_WINDOW_SINC = 0.44;
const float JINC2_SINC = 0.82;
const float JINC2_AR_STRENGTH = 0.5;

/*
	Hyllian's jinc windowed-jinc 2-lobe with anti-ringing Shader

	Copyright (C) 2011-2014 Hyllian/Jararaca - sergiogdb@gmail.com

	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	as published by the Free Software Foundation; either version 2
	of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
*/

/*
	This is an approximation of Jinc(x)*Jinc(x*r1/r2) for x < 2.5,
	where r1 and r2 are the first two zeros of jinc function.
	For a jinc 2-lobe best approximation, use A=0.5 and B=0.825.
*/

// A=0.5, B=0.825 is the best jinc approximation for x<2.5. if B=1.0, it's a lanczos filter.
// Increase A to get more blur. Decrease it to get a sharper picture.
// B = 0.825 to get rid of dithering. Increase B to get a fine sharpness, though dithering returns.

const float halfpi = 1.5707963267948966192313216916398;
const float pi = 3.1415926535897932384626433832795;

// Calculates the distance between two points
float d(vec2 pt1, vec2 pt2)
{
	vec2 v = pt2 - pt1;
	return sqrt(dot(v, v));
}

vec3 min4(vec3 a, vec3 b, vec3 c, vec3 d)
{
    return min(a, min(b, min(c, d)));
}
vec3 max4(vec3 a, vec3 b, vec3 c, vec3 d)
{
    return max(a, max(b, max(c, d)));
}



vec4 resampler(vec4 x)
{
	float wa = JINC2_WINDOW_SINC * pi;
	float wb = JINC2_SINC * pi;

  vec4 res;

  res = (x == vec4(0.0, 0.0, 0.0, 0.0)) ? vec4(wa * wb) : sin(x * wa) * sin( x * wb) / (x * x);

  return res;
}

out vec4 fragColor;
uniform sampler2D s_p;

in vertex
{
	vec2 texCoord;
} VAR;

layout (std140) uniform program
{
	vec2 video_size;
	vec2 texture_size;
	vec2 output_size;
} IN;

void main()
{
	vec3 color;
	mat4 weights;

	vec2 dx = vec2(1.0, 0.0);
	vec2 dy = vec2(0.0, 1.0);

	vec2 pc = VAR.texCoord * IN.texture_size;

	vec2 tc = (floor(pc-vec2(0.5,0.5))+vec2(0.5,0.5));

	weights[0] = resampler(vec4(d(pc, tc -dx -dy), d(pc, tc - dy), d(pc, tc + dx - dy), d(pc, tc + 2.0 * dx -dy)));
	weights[1] = resampler(vec4(d(pc, tc -dx), d(pc, tc), d(pc, tc + dx), d(pc, tc + 2.0 * dx)));
	weights[2] = resampler(vec4(d(pc, tc -dx + dy), d(pc, tc +dy), d(pc, tc + dx + dy), d(pc, tc + 2.0 * dx + dy)));
	weights[3] = resampler(vec4(d(pc, tc -dx + 2.0 * dy), d(pc, tc + 2.0 * dy), d(pc, tc + dx + 2.0 * dy), d(pc, tc + 2.0 * dx + 2.0 * dy)));

	dx = dx / IN.texture_size;
	dy = dy / IN.texture_size;
	tc = tc / IN.texture_size;

	// reading the texels

	vec3 c00 = texture(s_p, tc -dx -dy).xyz;
	vec3 c10 = texture(s_p, tc -dy).xyz;
	vec3 c20 = texture(s_p, tc + dx - dy).xyz;
	vec3 c30 = texture(s_p, tc + 2.0 * dx -dy).xyz;
	vec3 c01 = texture(s_p, tc -dx).xyz;
	vec3 c11 = texture(s_p, tc).xyz;
	vec3 c21 = texture(s_p, tc + dx).xyz;
	vec3 c31 = texture(s_p, tc + 2.0 * dx).xyz;
	vec3 c02 = texture(s_p, tc - dx + dy).xyz;
	vec3 c12 = texture(s_p, tc + dy).xyz;
	vec3 c22 = texture(s_p, tc + dx + dy).xyz;
	vec3 c32 = texture(s_p, tc + 2.0 * dx + dy).xyz;
	vec3 c03 = texture(s_p, tc - dx + 2.0 * dy).xyz;
	vec3 c13 = texture(s_p, tc + 2.0 * dy).xyz;
	vec3 c23 = texture(s_p, tc + dx + 2.0 * dy).xyz;
	vec3 c33 = texture(s_p, tc + 2.0 * dx + 2.0 * dy).xyz;

	//  Get min/max samples
	vec3 min_sample = min4(c11, c21, c12, c22);
	vec3 max_sample = max4(c11, c21, c12, c22);

	color = mat4x3(c00, c10, c20, c30) * weights[0];
	color += mat4x3(c01, c11, c21, c31) * weights[1];
	color += mat4x3(c02, c12, c22, c32) * weights[2];
	color += mat4x3(c03, c13, c23, c33) * weights[3];
	color = color / (dot(vec4(1, 1, 1, 1) * weights, vec4(1, 1, 1,1)));
	vec3 aux = color;
	color = clamp(color, min_sample, max_sample);

	color = mix(aux, color, JINC2_AR_STRENGTH);

	// final sum and weight normalization
	fragColor = vec4(color, 1);
}
