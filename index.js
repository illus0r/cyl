"use strict";

import {loadText} from './shdr/loadText.js'
import {Gl} from './shdr/gl.js'
import {Pr} from './shdr/pr.js'
import {Tx} from './shdr/tx.js'
import {rsz} from './shdr/rsz.js'

let isPlaying = true
let rndjs=[...Array(4)].map(_=>[fxrand()])
let mouse = [.5, .5];
let palette = [ "#000001", "#1D2B52", "#7E2552", "#008750", "#AB5235", "#5F574E", "#C2C3C8", "#FFF1E7", "#FF014D", "#FFA300", "#FFEC28", "#01E435", "#30ADFF", "#83769D", "#FF77A7", "#FFCCAB",
].sort(_=>fxrand()-.5).slice(0,5)
palette = palette.map(color => {
  color = color.slice(1)
  color = color.match(/(.{2})/g).map(v=>Number("0x"+v)/255)
  return color
})

let gl = new Gl('canvas')
let pr = new Pr(gl,loadText('./shader.frag'))
let prDr = new Pr(gl)

let u_tx=[]//.map(_=>new Tx(gl, tx_opt))
window.addEventListener('resize',resize, true)
window.dispatchEvent(new Event('resize'))

window.addEventListener('mousemove', e=>{
	let [w,h] = [gl.canvas.width, gl.canvas.height]
	mouse = [e.clientX/w*2-1, (1-e.clientY/h)*2-1]
})

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
			'palette': palette,
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
// save only if key S is pressed
document.addEventListener('keydown', e=>e.code=='KeyS'?saveImage():0)

