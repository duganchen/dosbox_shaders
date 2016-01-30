#version 330 core

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

layout(location = 0) in vec4 position;
layout(location = 1) in vec2 texCoord;

out vertex
{
	vec2 texCoord;
} VAR;


void main()
{
	gl_Position = position;
	VAR.texCoord = texCoord;
}
