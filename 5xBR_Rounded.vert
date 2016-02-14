#version 330 core
/*
   Hyllian's 5xBR v3.7a Shader
   
   Copyright (C) 2011, 2012 Hyllian/Jararaca - sergiogdb@gmail.com
   Copyright (C) 2012 crazy46guy (GLSL conversion)

   This program is free software; you can redistribute it and/or
   modify it under the terms of the GNU General Public License
   as published by the Free Software Foundation; either version 2
   of the License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

   (The original Cg version of the xBR family of shaders is available on
   Github: https://github.com/twinaphex/common-shaders/tree/master/xBR )
*/

layout(location = 0) in vec4 position;
layout(location = 1) in vec2 texCoord;

layout (std140) uniform program
{
	vec2 video_size;
	vec2 texture_size;
	vec2 output_size;
} IN;

out vec2 rubyTextureSize;
out vec2 texCoord0;
out vec4 texCoord1;
out vec4 texCoord2;
out vec4 texCoord3; 
out vec4 texCoord4;
out vec4 texCoord5;
out vec4 texCoord6;
out vec4 texCoord7;

void main() {
  rubyTextureSize = IN.texture_size;
   
  float dx = 1.0 / rubyTextureSize.x;
  float dy = 1.0 / rubyTextureSize.y;

  //     A1 B1 C1
  //  A0  A  B  C C4
  //  D0  D  E  F F4
  //  G0  G  H  I I4
  //     G5 H5 I5

  gl_Position = position;
  texCoord0 = texCoord;
  texCoord1 = texCoord0.xxxy + vec4(    -dx,   0,  dx, -2.0*dy);  //  A1 B1 C1
  texCoord2 = texCoord0.xxxy + vec4(    -dx,   0,  dx,     -dy);  //   A  B  C
  texCoord3 = texCoord0.xxxy + vec4(    -dx,   0,  dx,       0);  //   D  E  F
  texCoord4 = texCoord0.xxxy + vec4(    -dx,   0,  dx,      dy);  //   G  H  I
  texCoord5 = texCoord0.xxxy + vec4(    -dx,   0,  dx,  2.0*dy);  //  G5 H5 I5
  texCoord6 = texCoord0.xyyy + vec4(-2.0*dx, -dy,   0,      dy);  //  A0 D0 G0
  texCoord7 = texCoord0.xyyy + vec4( 2.0*dx, -dy,   0,      dy);  //  C4 F4 I4 
}
