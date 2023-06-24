#version 300 es
precision highp float;
uniform sampler2D tx;
uniform float frame;
uniform float pass;
uniform float time;
uniform vec2 res;
uniform vec2 mouse;
uniform float rndjs[4];
out vec4 o;

void main(){
	vec2 uv = (gl_FragCoord.xy*2.-res)/res.y;
	vec2 uvI = uv;
	
	mat2 z = mat2(uv,-uv.y,uv.x);

	mat2 a = mat2(mouse,0,0);
	a[1]=a[0].yx*vec2(-1,1);

	for(int i=0;i<8;i++){
		z *= z*z;
		z = z + a;
	}

	uv = z[0];

	/* o.rg=fract(uv+time); */
	o+=fract(length(uv.y)+time+atan(uvI.y,uvI.x)/3.1415/2.)/(length(uv));
	o.a=1.;
}
