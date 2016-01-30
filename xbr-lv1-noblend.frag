#version 330 core

/*
	 Hyllian's xBR-lv1-noblend Shader

	 Copyright (C) 2011-2014 Hyllian - sergiogdb@gmail.com

	 Permission is hereby granted, free of charge, to any person obtaining a copy
	 of this software and associated documentation files (the "Software"), to deal
	 in the Software without restriction, including without limitation the rights
	 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 copies of the Software, and to permit persons to whom the Software is
	 furnished to do so, subject to the following conditions:

	 The above copyright notice and this permission notice shall be included in
	 all copies or substantial portions of the Software.

	 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 THE SOFTWARE.

*/

const float XBR_Y_WEIGHT = 48.0;
const float XBR_EQ_THRESHOLD = 15.0;

// Enable just one of the three to choose the corner detection.
const bool CORNER_A = false;
const bool CORNER_B = false;
const bool CORNER_C = true;

const mat3 yuv = mat3(0.299, -0.169, 0.499, 0.587, -0.331, -0.418, 0.114, 0.499, -0.0813);


float RGBtoYUV(vec3 color)
{
	return dot(color, XBR_Y_WEIGHT * yuv[0]);
}


float df(float A, float B)
{
	return abs(A - B);
}


bool eq(float A, float B)
{
	return df(A, B) < XBR_EQ_THRESHOLD;
}


float weighted_distance(float a, float b, float c, float d, float e, float f, float g, float h)
{
	return df(a, b) + df(a, c) + df(d, e) + df(d, f) + 4.0 * df(g, h);
}


layout (std140) uniform program
{
	vec2 video_size;
	vec2 texture_size;
	vec2 output_size;
} IN;


in vertex
{
	vec2 texCoord;
	vec4 t1;
} VAR;


/*
		xBR LVL1 works over the pixels below:

			|B |C |
		 |D |E |F |F4|
		 |G |H |I |I4|
			|H5|I5|

		Consider E as the central pixel. xBR LVL1 needs only to look at 12 texture pixels.
*/

out vec4 color;

uniform sampler2D decal;

void main()
{
	bool edr, px; // px = pixel, edr = edge detection rule
	bool interp_restriction_lv1;
	bool nc; // new_color
	bool fx; // inequations of straight lines.

	vec2 pos = fract(VAR.texCoord * IN.texture_size) - vec2(0.5, 0.5); // pos = pixel position
	vec2 dir = sign(pos); // dir = pixel direction

	vec2 g1 = dir * VAR.t1.xy;
	vec2 g2 = dir * VAR.t1.zw;

	vec3 B = texture(decal, VAR.texCoord + g1 ).xyz;
	vec3 C = texture(decal, VAR.texCoord + g1 - g2).xyz;
	vec3 D = texture(decal, VAR.texCoord + g2).xyz;
	vec3 E = texture(decal, VAR.texCoord).xyz;
	vec3 F = texture(decal, VAR.texCoord - g2).xyz;
	vec3 G = texture(decal, VAR.texCoord - g1 + g2).xyz;
	vec3 H = texture(decal, VAR.texCoord - g1).xyz;
	vec3 I = texture(decal, VAR.texCoord - g1 - g2).xyz;

	vec3 F4 = texture(decal,VAR.texCoord - 2.0 * g2).xyz;
	vec3 I4 = texture(decal,VAR.texCoord - g1 - 2.0 * g2).xyz;
	vec3 H5 = texture(decal,VAR.texCoord - 2.0 * g1).xyz;
	vec3 I5 = texture(decal,VAR.texCoord -2.0 * g1 - g2).xyz;

	float b = RGBtoYUV(B);
	float c = RGBtoYUV(C);
	float d = RGBtoYUV(D);
	float e = RGBtoYUV(E);
	float f = RGBtoYUV(F);
	float g = RGBtoYUV(G);
	float h = RGBtoYUV(H);
	float i = RGBtoYUV(I);

	float i4 = RGBtoYUV(I4);
	float i5 = RGBtoYUV(I5);
	float h5 = RGBtoYUV(H5);
	float f4 = RGBtoYUV(F4);

	fx = dot(dir,pos) > 0.5;

	// It uses CORNER_C if none of the others are enabled.
	if (CORNER_A)
	{
		interp_restriction_lv1 = (( e != f) && (e != h));
	}
	else if (CORNER_B)
	{
		interp_restriction_lv1 = ((e != f) && (e != h) && (!eq(f, b) && !eq(h, d) || eq(e, i) && !eq(f, i4) && !eq(h, i5) || eq(e, g) || eq(e, c)));
	}
	else
	{
		interp_restriction_lv1 = ((e != f) && (e != h) && (!eq(f, b) && !eq(f, c) || !eq(h, d) && !eq(h, g) || eq(e, i) && (!eq(f, f4) && !eq(f, i4) || !eq(h, h5) && !eq(h, i5)) || eq(e, g) || eq(e, c)));
	}
	edr = (weighted_distance(e, c, g, i, h5, f4, h, f) < weighted_distance(h, d, i5, f, i4, b, e, i)) && interp_restriction_lv1;

	nc = edr && fx;

	px = df(e, f) <= df(e, h);

	vec3 res = nc ? px ? F : H : E;

	color = vec4(res, 1.0);
}
