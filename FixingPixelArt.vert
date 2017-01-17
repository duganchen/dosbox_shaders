#version 330 core

layout(location = 0) in vec4 position;
layout(location = 1) in vec2 textureCoord;

layout (std140) uniform program 
{
    vec2 video_size;
    vec2 texture_size;
    vec2 output_size;
} IN;


out vec2 iResolution;
out vec2 fragCoord;
out vec2 texCoord;

void main()
{
	gl_Position = position;
	iResolution = IN.output_size;
	texCoord = textureCoord;
}
