export let rsz = (gl,width,height,pixelDensity) => {
	let cnv = gl.canvas
	if(pixelDensity === undefined) pixelDensity = devicePixelRatio
	if(width === undefined) width	= cnv.clientWidth * pixelDensity
	if(height === undefined) height	= cnv.clientHeight * pixelDensity

	const needResize = cnv.width !== width ||
		cnv.height !== height

	if (needResize) {
		cnv.width = width
		cnv.height = height
		gl.viewport(0, 0, cnv.width, cnv.height)
	}
	return [width, height]
}
