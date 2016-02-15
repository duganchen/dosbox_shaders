#version 330 core
/*
	Gaussian-kernel TV Upscaler	
	version : 0.3
	Author: aliaspider - aliaspider@gmail.com
	License: GPLv3      	
*/
 
//------------------------------------------------------------------------------------//
// CONFIG :

// this will define the bandwidth of the signal per scanline
// a value of 640.0 or double the game horizontal resolution
// work well for most cases.
// you can set it to 512 to get full transparancy in snes
// games that use the psoeudo-hires video mode.
// higher BANDWIDTH = sharper image
#define BANDWIDTH 640.0


// scanline width
// scanlines will start to disappear with a value of 1.88.
// a value of 2.0 will produce a scanlines free image.
// lower values might require a higher resolution
// to display correctly
#define SCANLINE_WIDTH 1.3


// gamma of the current display device
// try reducing this value if the image feels too bright
#define OUTPUTG2	2.2


// gamma of the emulated CRT-TV
#define INPUTG2		2.4	
 
  
// horizontal computation range or the shader,
// increasing this value will increase performance requieremnts
// you might need to increase it if you notice
// some artifacts appearing with lower bandwidth settings.
// you only need to set this to the lowest value that doesnt 
// cause artifacts to appears.
// default : 2
#define X_RANGE 2


// CONFIG END.
//------------------------------------------------------------------------------------//
 

    uniform sampler2D 	rubyTexture;
    in vec2      	rubyTextureSize;	
	in vec2      	rubyInputSize;	
	
in vec2 texCoord;



#define GAMMAOUT(c0)	(pow(c0, vec3(1.0/OUTPUTG2)))
#define GAMMAIN(c)		(pow(c, vec3(INPUTG2)))


#define pi			3.14159265358
#define a(x) abs(x)
#define d(x,b) (pi*b*min(a(x)+0.5,1.0/b))
#define e(x,b) (pi*b*min(max(a(x)-0.5,-1.0/b),1.0/b))
#define STU(x,b) ((d(x,b)+sin(d(x,b))-e(x,b)-sin(e(x,b)))/(2.0*pi))
#define GAUSS(x,w) ((sqrt(2.0) / (w)) * (exp((-2.0 * pi * (x) * (x)) / ((w) * (w)))))


#define X(i) (offset.x-(i))
#define Y(j) (offset.y-(j))
#define SOURCE(i,j) vec2(texCoord.xy - vec2(X(i),Y(j))/rubyTextureSize.xy)
#define C(i,j) (GAMMAIN(texture(rubyTexture, SOURCE(i,j)).xyz))
#define VAL(i,j) (C(i,j)*STU(X(i),((BANDWIDTH/2.0)/rubyInputSize.x))*GAUSS(Y(j),SCANLINE_WIDTH))

out vec4 fragColor;

void main() {	
	vec2	offset	= fract((texCoord.xy * rubyTextureSize.xy) - 0.5);
	vec3	tempColor = vec3(0.0);	

#if (X_RANGE > 6)
	tempColor+=VAL(-6.0,-1.0)+VAL(-6.0,0.0)+VAL(-6.0,1.0)+VAL(-6.0,2.0);
	tempColor+=VAL(7.0,-1.0)+VAL(7.0,0.0)+VAL(7.0,1.0)+VAL(7.0,2.0);
#endif
#if (X_RANGE > 5)
	tempColor+=VAL(-5.0,-1.0)+VAL(-5.0,0.0)+VAL(-5.0,1.0)+VAL(-5.0,2.0);
	tempColor+=VAL(6.0,-1.0)+VAL(6.0,0.0)+VAL(6.0,1.0)+VAL(6.0,2.0);
#endif
#if (X_RANGE > 4)
	tempColor+=VAL(-4.0,-1.0)+VAL(-4.0,0.0)+VAL(-4.0,1.0)+VAL(-4.0,2.0);
	tempColor+=VAL(5.0,-1.0)+VAL(5.0,0.0)+VAL(5.0,1.0)+VAL(5.0,2.0);
#endif
#if (X_RANGE > 3)
	tempColor+=VAL(-3.0,-1.0)+VAL(-3.0,0.0)+VAL(-3.0,1.0)+VAL(-3.0,2.0);
	tempColor+=VAL(4.0,-1.0)+VAL(4.0,0.0)+VAL(4.0,1.0)+VAL(4.0,2.0);
#endif
#if (X_RANGE > 2)
	tempColor+=VAL(-2.0,-1.0)+VAL(-2.0,0.0)+VAL(-2.0,1.0)+VAL(-2.0,2.0);
	tempColor+=VAL(3.0,-1.0)+VAL(3.0,0.0)+VAL(3.0,1.0)+VAL(3.0,2.0);
#endif
#if (X_RANGE > 1)
	tempColor+=VAL(-1.0,-1.0)+VAL(-1.0,0.0)+VAL(-1.0,1.0)+VAL(-1.0,2.0);
	tempColor+=VAL(2.0,-1.0)+VAL(2.0,0.0)+VAL(2.0,1.0)+VAL(2.0,2.0);
#endif
	tempColor+=VAL(0.0,-1.0)+VAL(0.0,0.0)+VAL(0.0,1.0)+VAL(0.0,2.0);
	tempColor+=VAL(1.0,-1.0)+VAL(1.0,0.0)+VAL(1.0,1.0)+VAL(1.0,2.0);
	

	fragColor = vec4(GAMMAOUT(tempColor), 1.0);
}
