"use strict";

import {loadText} from './shdr/loadText.js'
import {Gl} from './shdr/gl.js'
import {Pr} from './shdr/pr.js'
import {Tx} from './shdr/tx.js'
import {rsz} from './shdr/rsz.js'

let isPlaying = true
let rndjs=[...Array(4)].map(_=>[fxrand()])
let mouse = [.5, .5];

let gl = new Gl('canvas')
let pr = new Pr(gl,
	`#version 300 es
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

int txId = 0;
vec2 txUv = vec2(1.);

float sdf(vec3 p){
	p.z-=4.;
	p.y+=.2;
	p.zy*=rot(-.5+.1*sin(time));
	vec3 pII = p;
	p.xz = vec2(length(p.xz),0.);
	vec3 pI = p;
	float e=999.;
	// ← 1

	// sides
	p = pI;
	float sides=p.x-.3-p.y*.1;

	// sides bottom
	p=pI;
	sides=max(-p.y,e);

	// cap
	p=pI;
  float cap =p.y-.7;

	p=pI;
	p.x-=.5;
	p.x=max(0.,p.x);
	p.xy -= clamp(p.xy,-.01,.01);
	e=min(length(p)-.0001,e);

	// slice hat
	e = max(-pII.z,e);


	return e;
}

void main(){
	vec2 uv = (gl_FragCoord.xy*2.-res)/res.y;
	vec2 uvI = uv;

	float j,d,e=1.;
	vec3 p,pI;
	for(;j++<99.&&e>1e-4;){
		p=normalize(vec3(uv,6.))*d+.0001;

		e=sdf(p);

		d+=e;
	}
	o+=3./j;

	o.rg*=txUv;
	o.a=1.;
}

`)
let prDr = new Pr(gl)

let u_tx=[]
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

