import {gl} from "../state.js"

//move to util
function readElements(id) {
	const elem = document.getElementById(id);
	let source = '';
	let child = elem.firstChild;
	while (child) {
		if (child.nodeType == 3) {
			source += child.textContent;
		}
		child = child.nextSibling;
	}
	
	return source
}

function buildShader(type, source) {
	let shader = gl.createShader(type) //allocate shader
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('Error when compiling shader : ' + gl.getShaderInfoLog(shader));
	}
	
	return shader
}

//load stage
let Shader = function(nameID) {
	this.name = nameID //assumed to be unique. otherwise shaders wouldn't be either
	
	//generate shader units from code
	this.vs = buildShader(gl.VERTEX_SHADER, readElements(nameID.concat("-vs")))
	this.fs = buildShader(gl.FRAGMENT_SHADER, readElements(nameID.concat("-fs")))
	
	//build shader program
	this.program = gl.createProgram();
	gl.attachShader(this.program, this.vs);
	gl.attachShader(this.program, this.fs);
	gl.linkProgram(this.program);
	
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        alert('Error when linking shaders');
    }
	
	this.attrib = {}
	this.uniforms = {}
}

Shader.currentPrgm = ""

Shader.prototype.bind = function() {
	gl.useProgram(this.program);
	Shader.currentPrgm = this.name //store state
}

Shader.prototype.get = function() {
	return this.program
}

Shader.prototype.getAttrib = function (name) {
	if (!Shader.currentPrgm === this.name) { //in strict mode should throw a warning at least.
		console.warning("trying to aquire Uniform handle of shader that isn't bound.")
		this.bind()
	}
	
	if (typeof(this.attrib[name]) === "undefined") {
		this.attrib[name] = gl.getAttribLocation(this.program, name)
	}
	
	return this.attrib[name]
}

Shader.prototype.getUniform = function(name) {
	if (!Shader.currentPrgm === this.name) { //in strict mode should throw a warning at least.
		console.warning("trying to aquire Uniform handle of shader that isn't bound.")
		this.bind()
	}
	
	if (typeof(this.uniforms[name]) === "undefined")
		this.uniforms[name] = gl.getUniformLocation(this.program, name)
	
	return this.uniforms[name]
}

export {Shader}