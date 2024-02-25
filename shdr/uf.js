function getUfSetter(type){
	// return (gl,loc,val) => gl.uniform1f(loc,val)
	switch(type){
		case 'float': return (gl,loc,val)=>gl.uniform1f(loc,val)
		case 'float[]': return (gl,loc,val)=>gl.uniform1fv(loc,val.flat())
		case 'vec2': return (gl,loc,val)=>gl.uniform2fv(loc,val)
		case 'vec3': return (gl,loc,val)=>gl.uniform3fv(loc,val)
		case 'vec4': return (gl,loc,val)=>gl.uniform4fv(loc,val)
		case 'vec3[]': return (gl,loc,val)=>gl.uniform3fv(loc,val.flat())
		case 'sampler2D': return (gl,loc,tx)=>{
			gl.uniform1i(loc,tx.loc)
		}
		case 'sampler3D': return (gl,loc,tx)=>{
			gl.uniform1i(loc,tx.loc)
		}
	}
}

function getUfType(value) {
	if(Array.isArray(value)){
		if(Array.isArray(value[0])){
			const len = value[0].length
			switch(len){
				case 1: return 'float[]'
				case 2: return 'vec2[]'
				case 3: return 'vec3[]'
				case 4: return 'vec4[]'
			}
		}
		else{
			const len = value.length
			switch(len){
				case 1: return 'float'
				case 2: return 'vec2'
				case 3: return 'vec3'
				case 4: return 'vec4'
				default: return 'float[]'
			}
		}
	}
	else if(typeof value == 'number'){
		return 'float'
	}
	else if(typeof value === 'object' && 'type' in value) {// quacks like a texture, then it probably is a texture
		return value.type // sampler2D or sampler3D are expected
	}
}

export function Uf(name, value, type) {
	type = type || getUfType(value)
	let setGlUniform = getUfSetter(type)
	let uf = {
		name,
		value,
		type,
		setGlUniform,
	}
	uf.set = (value) => {
		uf.value = value
		return uf
	} 
	return uf
}
