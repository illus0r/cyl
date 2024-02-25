export function Gl(canvasSelector) {
	let gl = document.querySelector(canvasSelector).getContext('webgl2',{
		preserveDrawingBuffer: true,
	})
	gl.getExtension('EXT_color_buffer_float')
	gl.getExtension('OES_texture_float_linear')
	return gl
}
