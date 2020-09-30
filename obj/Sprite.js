
const VERTEX_DIM = 3
const UV_DIM = 2


export Texture2D = function(context, path, resolution) {
	this.name = path
	this.gl = context
	this.state = 0
	
	this.tex = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

	this.state = 1

	const image = new Image();
	if (!resolution) {
		resolution = [512, 512];
	}
	image.width = resolution[0];
	image.height = resolution[1];
	image.onload = function () {
		this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
		this.gl.generateMipmap(this.gl.TEXTURE_2D);
		this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
		
		this.state = 2
	}.apply(this);
}

Texture2D.prototype.bindTo(position) {
	this.gl.activeTexture(position);
	this.gl.bindTexture(gl.TEXTURE_2D, this.tex);
}

export DynamicTexture2D = function(context) {
	this.gl = context
	if (typeof(DynamicTexture2D.framebuffer) === "undefined")
		DynamicTexture2D.framebuffer = this.gl.createFramebuffer()
	
	this.tex = gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, canvas.width, canvas.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
}

DynamicTexture2D.prototype.bindFramebuffer() {
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, DynamicTexture2D.framebuffer);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT)
}
DynamicTexture2D.prototype.unbindFramebuffer() {
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.tex, 0);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
}
DynamicTexture2D.prototype.bindTo(position) {
	this.gl.activeTexture(position);
	this.gl.bindTexture(gl.TEXTURE_2D, this.tex);
}


let Mesh = function(vertices, uv) {
	this.vertexCnt = Math.floor(vertices.length / VERTEX_DIM)
	this.uvCnt = Math.floor(uv.length / UV_DIM)
	
	//checking integrity of dataset
	if (vertices.length % VERTEX_DIM !== 0 || uv.length % UV_DIM !== 0)
		alert("Invalid mesh dataset. not able to divide array into vectors.")
	if (this.vertexCnt - this.uvCnt !== 0)
		alert("Count of UV and Vertex Coordinates don't match.")
	
	this.squareBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	this.squareTexCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareTexCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
}

Mesh.prototype.bindToVAO(positionAttrib, uvAttrib) {
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
	gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareTexCoordBuffer);
	gl.vertexAttribPointer(uvAttrib, 2, gl.FLOAT, false, 0, 0);
}

Mesh.prototype.draw() {
	this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCnt);
}

let Sprite = function(context, spritePath, transformation) {
	this.gl = context
	if (typeof(Sprite.MESH) === "undefined")
		Sprite.MESH = new Mesh([0.5, 0, 1, -0.5, 0, 1, 0.5, 0, 0, -0.5, 0, 0] /*ein 1 : 2 rechteck. eigentlich doch zeit fuer scale Matrizen*/, [ 1, 0, 0, 0, 1, 1, 0, 1])
	
	this.texture = new Texture2D(spritePath)
	this.shadow = new DynamicTexture2D(context)
	this.transform = transformation
}

Sprite.prototype.updateShadow = function(shader) {
	this.shadow.bindFramebuffer()
	
	Sprite.MESH.bindToVAO(shader.getAttrib('position'), shader.getAttrib('texCoord'))
	this.texture.bindTo(this.gl.TEXTURE0);
	
	Sprite.MESH.draw()
	
	this.shadow.unbindFramebuffer()
}

Sprite.prototype.draw = function(transform, lighting, isGUI) {
	/*
	if (!Texture.reallyDraw) {
		drawOrder.push({
			id,
			transform: mat4.clone(transform),
			lighting,
			y: mat4.getTranslation(vec3.create(), transform)[1]
		});
		return;
	}
	*/
	
	Sprite.MESH.bindToVAO(shader.getAttrib('position'), shader.getAttrib('texCoord'))
	this.texture.bindTo(this.gl.TEXTURE0);
	this.shadow.bindTo(this.gl.TEXTURE1);
	this.gl.uniform1i(shader.getUniform('texture'), 0);
	this.gl.uniform1i(shader.getUniform('shadowTexture'), 1);
	Sprite.MESH.draw()
}

export {Sprite}