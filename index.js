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
			uniform vec2 res;
			uniform float time;
			out vec4 o;
			void main(){
				vec2 uv = gl_FragCoord.xy/res;
				o = uv.xyxy;
				o.a=1.;
			}`,

	`#version 300 es
			in vec4 a_p;
			void main(){
					gl_Position = vec4(-1,-1,0,1);
					if(gl_VertexID==1)gl_Position = vec4(3,-1,0,1);
					if(gl_VertexID==2)gl_Position = vec4(-1,3,0,1);
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

