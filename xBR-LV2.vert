#version 330 core

layout(location = 0) in vec4 position;
layout(location = 1) in vec2 texCoord;

layout (std140) uniform program
{
   vec2 video_size;
   vec2 texture_size;
   vec2 output_size;
} IN;

out vertex
{
   vec2 t0;
   vec4 t1;
   vec4 t2;
   vec4 t3;
   vec4 t4;
   vec4 t5;
   vec4 t6;
   vec4 t7;
} VAR;

void main()
{
vec2 OGLSize    = IN.texture_size;
vec2 OGLInvSize = 1.0/OGLSize;
float dx = OGLInvSize.x;
float dy = OGLInvSize.y;

gl_Position = position;
VAR.t0 = texCoord;
VAR.t1 = VAR.t0.xxxy + vec4( -dx, 0, dx,-2.0*dy); // A1 B1 C1
VAR.t2 = VAR.t0.xxxy + vec4( -dx, 0, dx,    -dy); //  A  B  C
VAR.t3 = VAR.t0.xxxy + vec4( -dx, 0, dx,      0); //  D  E  F
VAR.t4 = VAR.t0.xxxy + vec4( -dx, 0, dx,     dy); //  G  H  I
VAR.t5 = VAR.t0.xxxy + vec4( -dx, 0, dx, 2.0*dy); // G5 H5 I5
VAR.t6 = VAR.t0.xyyy + vec4(-2.0*dx,-dy, 0,  dy); // A0 D0 G0
VAR.t7 = VAR.t0.xyyy + vec4( 2.0*dx,-dy, 0,  dy); // C4 F4 I4
}
