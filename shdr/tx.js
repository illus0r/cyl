let txCounter = 0

// TODO split into subclasses according to cases:
// - from a src (image, maybe video?)
// - from an html element
// - 3d texture


/**
 * Creates a texture
 * @param gl The WebGL rendering context.
 * @param options Options for configuring the texture.
 * @param [options.w=8] width
 * @param [options.h=8] height
 * @param [options.d=8] depth (for 3D textures)
 * @param [options.filter=gl.NEAREST] The texture filtering method.
 * @param [options.bits=32] The number of bits for texture (8 or 32)
 * @param [options.type='sampler2D'] The type of texture (e.g., 'sampler2D', 'sampler3D').
 * @param [options.loc] The index in unit textures.
 * @param [options.pixels] Array(w*h*4), 0-255 for 8 bits, 0-1 for 32 bits
 * @param [options.src] The image source URL or data URI
 * @param [options.callback] A callback function to be executed after loading the image.
 * @returns The created texture.
 */
export function Tx(gl, options) {
	let tx = gl.createTexture()
	let filter, pixels, bits
	tx.loc = txCounter // index in unit textures
	if(options!==undefined){
		tx.w = options.w || 8
		tx.h = options.h || 8
		tx.d = options.d || 8 // depth for 3d
		filter = options.filter || gl.NEAREST
		tx.bits = options.bits || 32
		tx.type = options.type || 'sampler2D'
		if(options.d !== undefined)
			tx.type = 'sampler3D'
		// if pixels is an array, use it. Otherwise it's a URL or an HTML element
		pixels = Array.isArray(options.pixels) ? options.pixels : null
		if(Number.isInteger(options.loc))
			tx.loc = options.loc
	}
	if(pixels){
		if(tx.bits == 32){
			pixels = new Float32Array(pixels)
		}
		else if(tx.bits == 8){
			pixels = new Uint8Array(pixels)
		}
	}

	if(tx.bits==32 && filter !== gl.NEAREST){
		console.warn('32 bit texture interpolation is not supported on iPhones')
	}

	gl.activeTexture(gl.TEXTURE0 + tx.loc)
	if(tx.type == 'sampler2D'){
		gl.bindTexture(gl.TEXTURE_2D, tx)
		// gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,tx.w,tx.h,0,gl.RGBA,gl.UNSIGNED_BYTE,null)

		if(tx.bits == 32)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, tx.w, tx.h, 0, gl.RGBA, gl.FLOAT, pixels)
		else if(tx.bits==8)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tx.w, tx.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter)
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter)
		gl.generateMipmap(gl.TEXTURE_2D)
	} else if(tx.type == 'sampler3D'){
		gl.bindTexture(gl.TEXTURE_3D, tx)
		if(tx.bits == 32)
			gl.texImage3D(gl.TEXTURE_3D,0,gl.RGBA32F,tx.w,tx.h,tx.d,0,gl.RGBA,gl.FLOAT,pixels)
		else if(tx.bits==8)
			gl.texImage3D(gl.TEXTURE_3D,0,gl.RGBA,tx.w,tx.h,tx.d,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels)
		gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MIN_FILTER,filter)
		gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MAG_FILTER,filter)
		gl.generateMipmap(gl.TEXTURE_3D)
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.GL_MIRRORED_REPEAT)
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.GL_MIRRORED_REPEAT)
		gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.GL_MIRRORED_REPEAT)

		// gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MIN_FILTER,filter)
		// gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MAG_FILTER,filter)
		// gl.generateMipmap(gl.TEXTURE_3D)
	}
	if(options.src!==undefined){
		// if string, load image
		if(typeof options.src === 'string'){
			tx.image = new Image()
			tx.image.src = options.src
			tx.image.addEventListener('load', function(event) {
				tx.w = event.srcElement.width
				tx.h = event.srcElement.height
				gl.activeTexture(gl.TEXTURE0 + tx.loc)
				gl.bindTexture(gl.TEXTURE_2D, tx)
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tx.image)
				gl.generateMipmap(gl.TEXTURE_2D)
				if(options.callback)options.callback(tx)
			});
		}
	}
	// if html element img or video
	// Может лучше в src класть? Или в отдельное свойство? Сложно становится уследить за всем
	if(options.pixels instanceof CanvasRenderingContext2D){
		let ctx = options.pixels
		let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
			tx.w = ctx.canvas.width
			tx.h = ctx.canvas.height
			gl.activeTexture(gl.TEXTURE0 + tx.loc)
			gl.bindTexture(gl.TEXTURE_2D, tx)
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tx.w, tx.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData.data)
			gl.generateMipmap(gl.TEXTURE_2D)
			if(options.callback)options.callback(tx)
	}
	txCounter++

	tx.generateMipmap = () => {
		gl.activeTexture(gl.TEXTURE0 + tx.loc)
		gl.bindTexture(gl.TEXTURE_2D, tx)
		gl.generateMipmap(gl.TEXTURE_2D)
	}

	return tx
}
