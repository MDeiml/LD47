
//TODO could provide global object caching shaders since they are name unique. that would theoretically reduce/remove initialization code


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

function buildShader(gl, type, source) {
	let shader = gl.createShader(type) //allocate shader
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('Error when compiling shader "' + id + '": ' + gl.getShaderInfoLog(shader));
	}
	
	return shader
}

//load stage
let Shader = function(context, nameID) {
	self.name = nameID //assumed to be unique. otherwise shaders wouldn't be either
	self.gl = context //store reference of gl context
	
	//generate shader units from code
	self.vs = buildShader(self.gl, self.gl.VERTEX_SHADER, readElements(nameID.concat("-vs")))
	self.fs = buildShader(self.gl, self.gl.FRAGMENT_SHADER, readElements(nameID.concat("-fs")))
	
	//build shader program
	self.program = self.gl.createProgram();
	self.gl.attachShader(self.program, self.vs);
	self.gl.attachShader(self.program, self.fs);
	self.gl.linkProgram(self.program);
	
	self.attrib = {}
	self.uniforms = {}
}

Shader.currentPrgm = ""

Shader.prototype.bind = function() {
	self.gl.useProgram(self.program);
	Shader.currentPrgm = self.name //store state
}

Shader.prototype.get = function() {
	return self.program
}

Shader.prototype.getAttrib = function (name) {
	if (!Shader.currentPrgm === self.name) { //in strict mode should throw a warning at least.
		console.warning("trying to aquire Uniform handle of shader that isn't bound.")
		self.bind()
	}
	
	if (!name in Object.keys(self.attrib))
		self.attrib[name] = self.gl.getAttribLocation(self.program, name)
	
	return self.attrib[name]
}

Shader.prototype.getUniform = function(name) {
	if (!Shader.currentPrgm === self.name) { //in strict mode should throw a warning at least.
		console.warning("trying to aquire Uniform handle of shader that isn't bound.")
		self.bind()
	}
	
	if (!name in Object.keys(self.uniforms))
		self.uniforms[name] = self.gl.getUniformLocation(self.program, name)
	return self.uniforms[name]
}

export {Shader}