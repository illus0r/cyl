"use strict";

import {loadText} from './shdr/loadText.js'
import {Gl} from './shdr/gl.js'
import {Pr} from './shdr/pr.js'
import {Tx} from './shdr/tx.js'
import {rsz} from './shdr/rsz.js'
 import {textures} from "./textures.js"
let isPlaying = true
let rndjs=[...Array(4)].map(_=>[fxrand()])
let mouse = [.5, .5];

let gl = new Gl('canvas')
let pr = new Pr(gl,
	`#version 300 es
precision highp float;
uniform sampler2D tx;
uniform float frame;
uniform float pass;
uniform float time;
uniform vec2 res;
uniform vec2 mouse;
uniform float rndjs[4];
uniform sampler2D tx_brim;
uniform sampler2D tx_crown;
uniform sampler2D tx_crown_tip;
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

int txId = 0;
vec2 txUv = vec2(1.);

float sdSegment( in vec2 p, in vec2 a, in vec2 b ){
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

float sdf(vec3 p){
	p.z-=4.;
	p.zx*=rot(time);
	p.zy*=rot(-.5+.8*sin(time));
	vec3 pII = p;
	// p.xz = vec2(length(p.xz),0.);
	vec3 pI = p;
	float e=999.;
	// ← 1

	float brimR = .8;
	float crownR = .5;
	float h = .8;

	float t = p.y - h/2.;
	float b = (p.y + h/2.)*.5;
	float s = (length(p.xz)-crownR)*.5;
	float S = length(p.xz)-brimR;

	float brim = max(abs(b),max(-s+.001,S));
	float crown = max(abs(s),max(t,-b));
	float tip = max(s,abs(t));

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

void main(){
	vec2 uv = (gl_FragCoord.xy*2.-res)/res.y;
	vec2 uvI = uv;

	float j,d,e=1.;
	vec3 p,pI;
	for(;j++<99.&&e>1e-4;){
		p=normalize(vec3(uv,3.))*d+.0001;

		e=sdf(p);

		d+=e;
	}
	// o+=3./j;
	if(d<9.)o++;

	switch(txId){
		case BRIM:
		o *= texture_tx_brim(txUv);
		break;
		case CROWN:
		o *= texture_tx_crown(txUv);
		break;
		case TIP:
		o *= texture_tx_crown_tip(txUv);
		break;
			case BRIM_BOT:
		o *= texture_tx_brim(txUv)*.2;
		break;
		case CROWN_IN:
		o *= texture_tx_crown(txUv)*.2;
		break;
	}
	o.a=1.;
}

`)
let prDr = new Pr(gl)

let u_tx=[]
let txBrim = new Tx(gl, {src:'1.png',loc:4})
let txCrown = new Tx(gl, {src:'2.png',loc:5})
let txCrownTip = new Tx(gl, {src:'3.png',loc:6})
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
			'tx_brim': txBrim,
			'tx_crown': txCrown,
			'tx_crown_tip': txCrownTip,
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

