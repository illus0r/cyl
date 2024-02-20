#version 300 es
precision highp float;
uniform sampler2D tx;
uniform sampler2D tx_rul;
uniform float frame;
uniform float pass;
uniform float time;
uniform vec2 res;
uniform vec2 mouse;
uniform float rndjs[4];
out vec4 o;

#define sabs(p) sqrt((p)*(p)+1e-3)
#define smin(a,b) (a+b-sabs(a-b))*.5
#define smax(a,b) (a+b+sabs(a-b))*.5

#define rot(a) mat2(cos(a),-sin(a),sin(a),cos(a))

void main(){
	vec2 uv = (gl_FragCoord.xy*2.-res)/res.y;
	vec2 uvI = uv;
	
	float j,d,e=1.;
	vec3 p,pI;
	for(;j++<99.&&e>1e-3;){
		p=normalize(vec3(uv,1))*d+.0001;
		p.z-=2.;
		p.zy*=rot(-.5+.1*sin(time));
		p.xz = vec2(length(p.xz),0.);
		pI = p;
		e=999.;



		p = pI;
		e=smin(p.x-.3-p.y*.1,e);

		p=pI;
		e=max(-p.y,e);

		p=pI;
		e=smax(p.y-.7,e);

		p=pI;
		p.x-=.5;
		p.x=smax(0.,p.x);
		p.xy -= clamp(p.xy,-.01,.01);
		e=min(length(p)-.01,e);


		d+=e;
	}
	o+=3./j;

	/* o.rg=fract(uv+time); */
	/* /1* o.rg+=fract(uv); *1/ */
	o.a=1.;
}

