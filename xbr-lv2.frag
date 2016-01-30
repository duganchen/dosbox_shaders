#version 330 core

const float XBR_SCALE = 3.0;
const float XBR_Y_WEIGHT = 48.0;
const float XBR_EQ_THRESHOLD = 15.0;
const float XBR_LV1_COEFFICIENT = 0.5;
const float XBR_LV2_COEFFICIENT = 2.0;

/*
   Hyllian's xBR-lv2 Shader

   Copyright (C) 2011-2015 Hyllian - sergiogdb@gmail.com

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

   Incorporates some of the ideas from SABR shader. Thanks to Joshua Street.
*/

// Enable just one of the three params below to choose the corner detection
bool CORNER_A = false;
bool CORNER_B = false;
bool CORNER_C = true;
bool CORNER_D = false;

const vec4 Ao = vec4( 1.0, -1.0, -1.0, 1.0 );
const vec4 Bo = vec4( 1.0,  1.0, -1.0,-1.0 );
const vec4 Co = vec4( 1.5,  0.5, -0.5, 0.5 );
const vec4 Ax = vec4( 1.0, -1.0, -1.0, 1.0 );
const vec4 Bx = vec4( 0.5,  2.0, -0.5,-2.0 );
const vec4 Cx = vec4( 1.0,  1.0, -0.5, 0.0 );
const vec4 Ay = vec4( 1.0, -1.0, -1.0, 1.0 );
const vec4 By = vec4( 2.0,  0.5, -2.0,-0.5 );
const vec4 Cy = vec4( 2.0,  0.0, -1.0, 0.5 );
const vec4 Ci = vec4(0.25, 0.25, 0.25, 0.25);

const vec3 Y = vec3(0.2126, 0.7152, 0.0722);


vec4 df(vec4 A, vec4 B)
{
	return vec4(abs(A-B));
}

float c_df(vec3 c1, vec3 c2)
{
	vec3 df = abs(c1 - c2);
	return df.r + df.g + df.b;
}

// Compare two vectors and return their components are different.
vec4 diff(vec4 A, vec4 B)
{
    return vec4(notEqual(A, B));
}

// Determine if two vector components are equal based on a threshold.
vec4 eq(vec4 A, vec4 B)
{
    return (step(df(A, B), vec4(XBR_EQ_THRESHOLD)));
}


// Determine if two vector components are NOT equal based on a threshold.
vec4 neq(vec4 A, vec4 B)
{
    return (vec4(1.0, 1.0, 1.0, 1.0) - eq(A, B));
}

vec4 weighted_distance(vec4 a, vec4 b, vec4 c, vec4 d, vec4 e, vec4 f, vec4 g, vec4 h)
{
	return (df(a,b) + df(a,c) + df(d,e) + df(d,f) + 4.0*df(g,h));
}

layout (std140) uniform program
{
	vec2 video_size;
	vec2 texture_size;
	vec2 output_size;
} IN;


in out_vertex
{
	vec2 texCoord;
	vec4 t1;
	vec4 t2;
	vec4 t3;
	vec4 t4;
	vec4 t5;
	vec4 t6;
	vec4 t7;
} VAR;

out vec4 fragColor;

uniform sampler2D decal;

void main()
{
	vec4 edri, edr, edr_left, edr_up, px; // px = pixel, edr = edge detection rule
	vec4 interp_restriction_lv0, interp_restriction_lv1, interp_restriction_lv2_left, interp_restriction_lv2_up;
	vec4 fx, fx_left, fx_up; // inequations of straight lines.

	vec4 delta         = vec4(1.0/XBR_SCALE, 1.0/XBR_SCALE, 1.0/XBR_SCALE, 1.0/XBR_SCALE);
	vec4 deltaL        = vec4(0.5/XBR_SCALE, 1.0/XBR_SCALE, 0.5/XBR_SCALE, 1.0/XBR_SCALE);
	vec4 deltaU        = deltaL.yxwz;

	vec2 fp = fract(VAR.texCoord*IN.texture_size);

	vec3 A1 = texture(decal, VAR.t1.xw).rgb;
	vec3 B1 = texture(decal, VAR.t1.yw).rgb;
	vec3 C1 = texture(decal, VAR.t1.zw).rgb;

	vec3 A  = texture(decal, VAR.t2.xw).rgb;
	vec3 B  = texture(decal, VAR.t2.yw).rgb;
	vec3 C  = texture(decal, VAR.t2.zw).rgb;

	vec3 D  = texture(decal, VAR.t3.xw).rgb;
	vec3 E  = texture(decal, VAR.t3.yw).rgb;
	vec3 F  = texture(decal, VAR.t3.zw).rgb;

	vec3 G  = texture(decal, VAR.t4.xw).rgb;
	vec3 H  = texture(decal, VAR.t4.yw).rgb;
	vec3 I  = texture(decal, VAR.t4.zw).rgb;

	vec3 G5 = texture(decal, VAR.t5.xw).rgb;
	vec3 H5 = texture(decal, VAR.t5.yw).rgb;
	vec3 I5 = texture(decal, VAR.t5.zw).rgb;

	vec3 A0 = texture(decal, VAR.t6.xy).rgb;
	vec3 D0 = texture(decal, VAR.t6.xz).rgb;
	vec3 G0 = texture(decal, VAR.t6.xw).rgb;

	vec3 C4 = texture(decal, VAR.t7.xy).rgb;
	vec3 F4 = texture(decal, VAR.t7.xz).rgb;
	vec3 I4 = texture(decal, VAR.t7.xw).rgb;

	vec4 b = (XBR_Y_WEIGHT*Y) * mat4x3(B, D, H, F);
	vec4 c = (XBR_Y_WEIGHT*Y) * mat4x3(C, A, G, I);
	vec4 e = (XBR_Y_WEIGHT*Y) * mat4x3(E, E, E, E);
	vec4 d = b.yzwx;
	vec4 f = b.wxyz;
	vec4 g = c.zwxy;
	vec4 h = b.zwxy;
	vec4 i = c.wxyz;

	vec4 i4 = (XBR_Y_WEIGHT*Y) * mat4x3(I4, C1, A0, G5);
	vec4 i5 = (XBR_Y_WEIGHT*Y) * mat4x3(I5, C4, A1, G0);
	vec4 h5 = (XBR_Y_WEIGHT*Y) * mat4x3(H5, F4, B1, D0);
	vec4 f4 = h5.yzwx;

	// These inequations define the line below which interpolation occurs.
	fx      = (Ao*fp.y+Bo*fp.x);
	fx_left = (Ax*fp.y+Bx*fp.x);
	fx_up   = (Ay*fp.y+By*fp.x);

	interp_restriction_lv1 = interp_restriction_lv0 = diff(e, f) * diff(e, h);

	if (CORNER_B)
	{
		interp_restriction_lv1 = (interp_restriction_lv0  *  ( neq(f,b) * neq(h,d) + eq(e,i) * neq(f,i4) * neq(h,i5) + eq(e,g) + eq(e,c) ) );
	}
	if (CORNER_D)
	{
		vec4 c1 = i4.yzwx;
		vec4 g0 = i5.wxyz;
		interp_restriction_lv1 = (interp_restriction_lv0  *  ( neq(f,b) * neq(h,d) + eq(e,i) * neq(f,i4) * neq(h,i5) + eq(e,g) + eq(e,c) ) * (diff(f, f4) * diff(f, i) + diff(h, h5) * diff(h, i) + diff(h, g) + diff(f, c) + eq(b,c1) * eq(d,g0)));
	}
	if (CORNER_C)
	{
		interp_restriction_lv1 = (interp_restriction_lv0  * ( neq(f,b) * neq(f,c) * neq(h,d) * neq(h,g) * eq(e,i) * (neq(f,f4) * neq(f,i4) * neq(h,h5) * neq(h,i5)) * eq(e,g) * eq(e,c)) );
	}

	interp_restriction_lv2_left = diff(e, g) * diff(d, g);
	interp_restriction_lv2_up   = diff(e, c) * (b, c);

	vec4 fx45i = clamp((fx      + delta  -Co - Ci)/(2*delta ), 0.0, 1.0);
	vec4 fx45  = clamp((fx      + delta  -Co     )/(2*delta ), 0.0, 1.0);
	vec4 fx30  = clamp((fx_left + deltaL -Cx     )/(2*deltaL), 0.0, 1.0);
	vec4 fx60  = clamp((fx_up   + deltaU -Cy     )/(2*deltaU), 0.0, 1.0);

	vec4 wd1 = weighted_distance( e, c, g, i, h5, f4, h, f);
	vec4 wd2 = weighted_distance( h, d, i5, f, i4, b, e, i);

	edri     = step(wd1, wd2) * interp_restriction_lv0;
	edr      = step(wd1 + vec4(0.1, 0.1, 0.1, 0.1),  wd2) * interp_restriction_lv1;
	edr_left = step(XBR_LV2_COEFFICIENT * df(f,g), df(h,c)) * interp_restriction_lv2_left * edr;
	edr_up   = step((XBR_LV2_COEFFICIENT*df(h,c)), df(f,g)) * interp_restriction_lv2_up * edr;

	fx45  = edr*fx45;
	fx30  = edr_left*fx30;
	fx60  = edr_up*fx60;
	fx45i = edri*fx45i;

	px = step(df(e,f), df(e,h));


	bool SMOOTH_TIPS = !CORNER_A;
	vec4 maximos;
	if (SMOOTH_TIPS)
	{
		maximos = max(max(fx30, fx60), max(fx45, fx45i));
	}
	else
	{
		maximos = max(max(fx30, fx60), fx45);
	}

	vec3 res1 = E;
	res1 = mix(res1, mix(H, F, px.x), maximos.x);
	res1 = mix(res1, mix(B, D, px.z), maximos.z);

	vec3 res2 = E;
	res2 = mix(res2, mix(F, B, px.y), maximos.y);
	res2 = mix(res2, mix(D, H, px.w), maximos.w);

	vec3 res = mix(res1, res2, step(c_df(E, res1), c_df(E, res2)));

	fragColor = vec4(res, 1.0);
}


