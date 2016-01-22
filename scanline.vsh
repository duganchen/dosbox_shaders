#version 330 core

layout(location = 0) in vec4 position;
layout(location = 1) in vec2 texCoord;

layout (std140) uniform program_input
{
	vec2 video_size;
	vec2 texture_size;
	vec2 output_size;
} IN;

out vec2 tex;

out sine_coord
{
	vec2 omega;
} coords;

void main()
{
	gl_Position = position;
	tex = texCoord;
	coords.omega = vec2(3.1415 * IN.output_size.x * IN.texture_size.x / IN.video_size.x, 2.0 * 3.1415 * IN.texture_size.y);
}
