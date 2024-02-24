"use strict";

import {loadText} from './shdr/loadText.js'
import {Gl} from './shdr/gl.js'
import {Pr} from './shdr/pr.js'
import {Tx} from './shdr/tx.js'
import {rsz} from './shdr/rsz.js'
import {textures} from "./textures/textures.js"
let isPlaying = true
let rndjs=[...Array(4)].map(_=>[fxrand()])
let mouse = [.5, .5];

let gl = new Gl('canvas')
let pr = new Pr(gl,
	`#version 300 es
precision highp float;
uniform sampler2D tx;
uniform sampler2D tx_bg;
uniform sampler2D tx_fg;
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
#define BRIM 1
#define CROWN 2
#define TIP 3
#define BRIM_BOT 4
#define CROWN_IN 5
#define BG 6
#define FG 7

#define F float
#define V vec2
#define W vec3
#define L length
#define N normalize 
#define S(x) sin(x+2.*sin(x+4.*sin(x)))
#define rnd(x) fract(1.1e4*sin(mod(111.1*(x),3.14)+.1))
#define col(x) (cos(x+W(0,.3,.6)*6.28)*.5+.5)
#define sfloor(x) smoothstep(0.,.9,fract(x))+floor(x)

int txId = 0;
vec2 txUv = vec2(1.);

vec3 pcg(vec3 vv){
    uvec3 v=uvec3(abs(vv+1e-6)*1664525.)+1013904223u;
    v+=v.yzx*v.zxy;
    v^=v>>16u;
    v+=v.yzx*v.zxy;
    return vec3(v%10000u)/10000.;
}

float sdf(vec3 p){
	p.zy*=rot(.5);
	vec3 pII = p;
	// p.xz = vec2(length(p.xz),0.);
	vec3 pI = p;
	float e=999.;
	// ← 1

	float brimR = .8;
	float crownR = .5;
	float h = .8;

	// top plane
	float t = p.y - h/2.;
	// bottom plane
	float b = (p.y + h/2.)*.5;
	// small cyl
	float s = (length(p.xz)-crownR)*.5;
	// large cyl
	float S = length(p.xz)-brimR;


	// float brimCyl=max(0.,abs(length(p.xz)-.5)-.2);
	float x = length(p.xz);
	x -=clamp(x,crownR,brimR);
	// float brimCyl=max(0.,x-clamp(x,0.,brimR-crownR));
	float brimCyl=x;
	float brim = length(vec2(brimCyl,b))-.005;

	float crownPlane = max(0.,abs(p.y)-h/2.);
	float crown = length(vec2(s,crownPlane))-.005;
	
	float tip = length(vec2(max(0.,s),t))-.005;

	txId = BRIM;
	if(b<0.)txId=BRIM_BOT;
	txUv = vec2(pII.xz/brimR)*.5+.5;
	e = brim;

	if(e>crown){
		txId = CROWN;
		txUv = vec2((p.y+h/2.)/h, atan(pII.x,pII.z)/2./3.1415);
		e = crown;
		if(s<0.)txId=CROWN_IN;
	}
	if(e>tip){
		txId = TIP;
		txUv = vec2(pII.xz/crownR)*.5+.5;
		e = tip;
	}

	e = min(min(brim,crown),tip)-.01;




	return e;
}

${textures}

vec3 normal(vec3 p){
	float d=sdf(p); vec2 e=vec2(0,.0001);
	return normalize(vec3(d-sdf(p-e.yxx),d-sdf(p-e.xyx),d-sdf(p-e.xxy)));
}

void main(){
	vec2 duv = fract(frame*vec2(.6180339887, .324717957));

	vec2 uv = (gl_FragCoord.xy*2.+2.*duv-res)/res.y;
	vec2 uvI = uv;
	vec3 nPl = vec3(0);

	float i,d,e=1.;
	vec3 p,pI,rd=normalize(vec3(uv,-3.)),ro=vec3(0,0,4);
	// float dBg = abs(.5-ro.z)/rd.z;
	// bool isBgPassed = false;
	// float dFg = abs(p.z+1.)/rd.z+.0001;

	vec3 c = vec3(1);
	bool light = false;
	for(float r=0.;r<2.;r++){
		for(i=0.,d=0.,e=1.;i++<99.&&e>1e-4;){
			p=rd*d+.0001+ro;
			if(p.y>4.){
				c*=vec3(1.);
				light = true;
				break;
			}

			float eBg = (+1.-p.z)/rd.z;
			float eFg = (-1.-p.z)/rd.z;

			e=sdf(p);
			if(eBg<0.) eBg = 9999.;
			if(eFg<0.) eFg = 9999.;

			//{{{
			// if(e>eBg && eFg>eBg){
			// 	e=eBg+.001;
			// 	txUv = vec2((ro+rd*(d+eBg)).xy);
			// 	vec4 t= texture(tx_bg,txUv*3.);
			// 	if(t.r<.5){
			// 		txId = BG;
			// 		nPl = vec3(0,0,sign(eBg));
			// 		break;
			// 	}
			// }

			// if(e>eFg && eBg>eFg){
			// 	e=eFg+.001;
			// 	txUv = vec2((ro+rd*(d+eFg)).xy);
			// 	vec4 t= texture(tx_fg,txUv*3.1415);
			// 	if(t.r<.5){
			// 		txId = FG;
			// 		nPl = vec3(0,0,sign(eFg));
			// 		break;
			// 	}
			// }
			//}}}

			d+=e;
		}
		if(light) break;
		vec3 n = normal(p);
		if(txId==BG || txId==FG) n=nPl;
		// o.rgb=n*.5+.5;o.a=1.;  return;
		c.rgb*=n*.5+.5;


		ro=p+n*.002;
		rd=reflect(rd,n);
		rd+=pcg(rd+p+time+r)*.5;

		switch(txId){
			case BRIM:
				c *= texture_tx_brim(txUv).rgb;
				break;
			case CROWN:
				c *= texture_tx_crown(txUv).rgb;
				break;
			case TIP:
				c *= texture_tx_crown_tip(txUv).rgb;
				break;
			case BRIM_BOT:
				c *= texture_tx_brim_bottom(txUv).rgb;
				break;
			case CROWN_IN:
				c *= texture_tx_crown_inner(txUv).rgb;
				break;
			case BG:
				c *=vec4(1,1,0,1).rgb;
				break;
			case FG:
				c *=vec4(1,0,1,1).rgb;
				break;
		}

	}
	if(!light) c*=0.;

	o.rgb = c;
	o=clamp(o,vec4(0),vec4(1));
	o=mix(texelFetch(tx,ivec2(gl_FragCoord.xy),0),o,1./(frame+1.));
	o.a=1.;

}

`)
let prDr = new Pr(gl)

let u_tx=[]
let txBg = new Tx(gl, {src:'1.png',loc:4})
let txFg = new Tx(gl, {src:'2.png',loc:5})
window.addEventListener('resize',resize, true)
window.dispatchEvent(new Event('resize'))

let timeInit=+new Date()
let timePrev=timeInit
let timeNew=timeInit
let u_frame=0

function frame() {
	timePrev=timeNew
	timeNew=+new Date()
	let time = (timeNew-timeInit)/1000
	u_frame++

	if(isPlaying && u_tx.length > 0){
		pr.uf({
			'time': time,
			'res': [u_tx[0].w,u_tx[0].h],
			'tx': u_tx[0],
			'tx_bg': txBg,
			'tx_fg': txFg,
			'frame': u_frame,
			'mouse': mouse,
			'rndjs': rndjs,
		})
		pr.draw(u_tx[1])

		u_tx.reverse()

		prDr.uf({
			'time': time,
			'res': [gl.canvas.width,gl.canvas.height],
			'tx': u_tx[0],
			'frame': u_frame,
			'rndjs': rndjs,
		})
		prDr.draw()
	}
	else{ 
		timeInit+=timeNew-timePrev
	}
	requestAnimationFrame(frame)
}
if(gl.getProgramParameter(pr, gl.LINK_STATUS)) frame()


// EVENTS

window.addEventListener('mousemove', e=>{
	let [w,h] = [gl.canvas.width, gl.canvas.height]
	mouse = [e.clientX/w*2-1, (1-e.clientY/h)*2-1]
})

document.addEventListener('keydown', (event) => {
	if (event.code === 'Space') {
		isPlaying=!isPlaying
		return
	}
}, false)

function resize(){
	if(u_tx.length > 0){
		u_tx.forEach(tx=>gl.deleteTexture(tx))
	}
	let [w,h] = rsz(gl)
	u_tx=[0,0].map((_,i)=>new Tx(gl, {w:w,h:h,loc:i}))
}

function saveImage (e){
	let downloadLink = document.createElement('a');
	downloadLink.setAttribute('download', `${fxhash}.png`);
	// let canvas = document.getElementById('Canvas');
	let canvas = document.querySelector('canvas')
	canvas.toBlob(function(blob) {
		let url = URL.createObjectURL(blob);
		downloadLink.setAttribute('href', url);
		downloadLink.click();
	});
}
document.addEventListener('keydown', e=>e.code=='KeyS'?saveImage():0)

