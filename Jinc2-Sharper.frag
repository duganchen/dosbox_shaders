#version 330 core
/*
   Hyllian's jinc windowed-jinc 2-lobe sharper with anti-ringing Shader
   
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

*/

const   float halfpi            = 1.5707963267948966192313216916398;
const   float pi                = 3.1415926535897932384626433832795;
const   float JINC2_WINDOW_SINC = 0.42;
const   float JINC2_SINC        = 0.92;
const   float wa                = JINC2_WINDOW_SINC*pi;
const   float wb                = JINC2_SINC*pi;
const   float JINC2_AR_STRENGTH = 0.8;

/*
const   vec2 OGLSize    = vec2( 4096.0, 2048.0 );
const   vec2 OGLInvSize = vec2( 1.0/4096.0, 1.0/2048.0 );
const   vec2 dx         = vec2( 1.0/4096.0, 0.0 );
const   vec2 dy         = vec2( 0.0, 1.0/2048.0 );
*/
/*
const   vec2 OGLSize    = vec2( 1024.0, 512.0);
const   vec2 OGLInvSize = vec2( 0.0009765625, 0.001953125); 
const   vec2 dx         = vec2( 0.0009765625, 0.0);
const   vec2 dy         = vec2( 0.0, 0.001953125 );
*/

//uniform vec4 OGL2InvSize;
//uniform vec4 OGL2Size;


// Calculates the distance between two points
float d(vec2 pt1, vec2 pt2)
{
  vec2 v = pt2 - pt1;
  return sqrt(dot(v,v));
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
   vec4 res;

   res = (x==vec4(0.0, 0.0, 0.0, 0.0)) ?  vec4(wa*wb)  :  sin(x*wa)*sin(x*wb)/(x*x);

   return res;
}



uniform sampler2D OGL2Texture;
in vec2 OGL2Size;
in vec2 texCoord;
out vec4 fragColor;

void main()
{

    vec3 color;
    vec4 weights[4];

    vec2 Dx = vec2(1.0, 0.0);
    vec2 Dy = vec2(0.0, 1.0);
    vec2 OGL2InvSize = 1.0/OGL2Size;

    vec2 dx = vec2(OGL2InvSize.x,0.0);
    vec2 dy = vec2(0.0, OGL2InvSize.y);

    vec2 pc = texCoord.xy*OGL2Size.xy;

    vec2 tc = (floor(pc-vec2(0.5,0.5))+vec2(0.5,0.5));
     
    weights[0] = resampler(vec4(d(pc, tc    -Dx    -Dy), d(pc, tc           -Dy), d(pc, tc    +Dx    -Dy), d(pc, tc+2.0*Dx    -Dy)));
    weights[1] = resampler(vec4(d(pc, tc    -Dx       ), d(pc, tc              ), d(pc, tc    +Dx       ), d(pc, tc+2.0*Dx       )));
    weights[2] = resampler(vec4(d(pc, tc    -Dx    +Dy), d(pc, tc           +Dy), d(pc, tc    +Dx    +Dy), d(pc, tc+2.0*Dx    +Dy)));
    weights[3] = resampler(vec4(d(pc, tc    -Dx+2.0*Dy), d(pc, tc       +2.0*Dy), d(pc, tc    +Dx+2.0*Dy), d(pc, tc+2.0*Dx+2.0*Dy)));

    tc = tc*OGL2InvSize.xy;

    vec3 c00 = texture(OGL2Texture, tc    -dx    -dy).xyz;
    vec3 c10 = texture(OGL2Texture, tc           -dy).xyz;
    vec3 c20 = texture(OGL2Texture, tc    +dx    -dy).xyz;
    vec3 c30 = texture(OGL2Texture, tc+2.0*dx    -dy).xyz;
    vec3 c01 = texture(OGL2Texture, tc    -dx       ).xyz;
    vec3 c11 = texture(OGL2Texture, tc              ).xyz;
    vec3 c21 = texture(OGL2Texture, tc    +dx       ).xyz;
    vec3 c31 = texture(OGL2Texture, tc+2.0*dx       ).xyz;
    vec3 c02 = texture(OGL2Texture, tc    -dx    +dy).xyz;
    vec3 c12 = texture(OGL2Texture, tc           +dy).xyz;
    vec3 c22 = texture(OGL2Texture, tc    +dx    +dy).xyz;
    vec3 c32 = texture(OGL2Texture, tc+2.0*dx    +dy).xyz;
    vec3 c03 = texture(OGL2Texture, tc    -dx+2.0*dy).xyz;
    vec3 c13 = texture(OGL2Texture, tc       +2.0*dy).xyz;
    vec3 c23 = texture(OGL2Texture, tc    +dx+2.0*dy).xyz;
    vec3 c33 = texture(OGL2Texture, tc+2.0*dx+2.0*dy).xyz;

    color = texture(OGL2Texture, texCoord.xy).xyz;

    //  Get min/max samples
    vec3 min_sample = min4(c11, c21, c12, c22);
    vec3 max_sample = max4(c11, c21, c12, c22);

    color = vec3(dot(weights[0], vec4(c00.x, c10.x, c20.x, c30.x)), dot(weights[0], vec4(c00.y, c10.y, c20.y, c30.y)), dot(weights[0], vec4(c00.z, c10.z, c20.z, c30.z)));
    color+= vec3(dot(weights[1], vec4(c01.x, c11.x, c21.x, c31.x)), dot(weights[1], vec4(c01.y, c11.y, c21.y, c31.y)), dot(weights[1], vec4(c01.z, c11.z, c21.z, c31.z)));
    color+= vec3(dot(weights[2], vec4(c02.x, c12.x, c22.x, c32.x)), dot(weights[2], vec4(c02.y, c12.y, c22.y, c32.y)), dot(weights[2], vec4(c02.z, c12.z, c22.z, c32.z)));
    color+= vec3(dot(weights[3], vec4(c03.x, c13.x, c23.x, c33.x)), dot(weights[3], vec4(c03.y, c13.y, c23.y, c33.y)), dot(weights[3], vec4(c03.z, c13.z, c23.z, c33.z)));
    color = color/(dot(weights[0], vec4(1,1,1,1)) + dot(weights[1], vec4(1,1,1,1)) + dot(weights[2], vec4(1,1,1,1)) + dot(weights[3], vec4(1,1,1,1)));

    // Anti-ringing
    vec3 aux = color;
    color = clamp(color, min_sample, max_sample);
    color = mix(aux, color, JINC2_AR_STRENGTH);

    // final sum and weight normalization
    fragColor.xyz = color;

}
