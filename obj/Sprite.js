import {mat4, vec2, vec3, quat} from "../gl-matrix-min.js"

const VERTEX_DIM = 3;
const UV_DIM = 2;

let wireframe = true

let texList = {};

export let Texture2D = function(gl, path, resolution) {
	this.gl = gl;
	this.name = path;

	if (!this.name in Object.keys(texList)) {
		this.image = texList[this.name].image;
		this.tex = texList[this.name].tex;
	} else {
		this.tex = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
		//this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		if (!resolution) {
			resolution = [512, 512];
		}
		this.image.width = resolution[0];
		this.image.height = resolution[1];
		this.image.onload = function () {
			this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

			this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
			this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

			//this.gl.generateMipmap(this.gl.TEXTURE_2D); //should be done after setting clamping/filtering so that it can't encounter power of 2 issues
		}.bind(this);
		this.image.src = path;

		texList[this.name] = this;
	}

}

Texture2D.prototype.bindTo = function(position) {
	this.gl.activeTexture(position);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
}

export let DynamicTexture2D = function(gl) {
	this.gl = gl;
	if (typeof(DynamicTexture2D.framebuffer) === "undefined")
		DynamicTexture2D.framebuffer = this.gl.createFramebuffer();

	this.tex = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);

	//based on canvas this is optimal resolution but a nonstatic value forces reconstruction on resize :/
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 2048, 2048/*this.gl.canvas.width, this.gl.canvas.height*/, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, DynamicTexture2D.framebuffer);
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.tex, 0);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
}

DynamicTexture2D.prototype.bindFramebuffer = function() {
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, DynamicTexture2D.framebuffer);

	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
}
DynamicTexture2D.prototype.unbindFramebuffer = function() {
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
}
DynamicTexture2D.prototype.bindTo = function(position) {
	this.gl.activeTexture(position);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
}


let Mesh = function(gl, vertices, uv) {
	this.gl = gl;
	this.vertexCnt = Math.floor(vertices.length / VERTEX_DIM);
	this.uvCnt = Math.floor(uv.length / UV_DIM);

	//checking integrity of dataset
	if (vertices.length % VERTEX_DIM !== 0 || uv.length % UV_DIM !== 0)
		alert("Invalid mesh dataset. not able to divide array into vectors.");
	if (this.vertexCnt - this.uvCnt !== 0)
		alert("Count of UV and Vertex Coordinates don't match.");

	this.squareBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

	this.squareTexCoordBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareTexCoordBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv), this.gl.STATIC_DRAW);
}

Mesh.prototype.bindToVAO = function(positionAttrib, uvAttrib) {
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareBuffer);
	this.gl.vertexAttribPointer(positionAttrib, VERTEX_DIM, this.gl.FLOAT, false, 0, 0);

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareTexCoordBuffer);
	this.gl.vertexAttribPointer(uvAttrib, UV_DIM, this.gl.FLOAT, false, 0, 0);
}

Mesh.prototype.draw = function() {
	if (wireframe)
	this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.vertexCnt);
	else
	this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCnt);
}

let Sprite = function(gl, spritePath, transformation, parent) {
	this.gl = gl;
	if (typeof(Sprite.MESH) === "undefined")
		Sprite.MESH = new Mesh(gl, [1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0] , [ 1, 0, 0, 0, 1, 1, 0, 1]); //screen square

	this.texture = new Texture2D(gl, spritePath);
	this.shadow = new DynamicTexture2D(gl);
	this.transform = typeof(transformation) === "undefined" ? mat4.create() : mat4.clone(transformation);
	this.m = mat4.create();
	this.parent = typeof(parent) === "undefined" ? null : parent;
	this.visibility = true;
}

Sprite.prototype.updateShadow = function(shader) {
	this.shadow.bindFramebuffer();

	this.texture.bindTo(this.gl.TEXTURE0);
	this.gl.uniformMatrix4fv(shader.getUniform('M'), false, this.getTransformation()); //write model transformation
	this.gl.uniform1i(shader.getUniform('texture'), 0);

	Sprite.MESH.bindToVAO(shader.getAttrib('position'), shader.getAttrib('texCoord'));
	Sprite.MESH.draw();

	this.shadow.unbindFramebuffer();
}

Sprite.prototype.getTransformation = function() {
	if (this.parent !== null)
		mat4.mult(this.m, this.transform, this.parent.getTransformation());
	else
		mat4.copy(this.m, this.transform);
	return this.m;
}
Sprite.prototype.setTransformation = function(transformation) {
	mat4.copy(this.transform, transformation);
}

Sprite.prototype.setVisibility = function(isVisible) {
	this.visibility = isVisible;
}

Sprite.prototype.draw = function(shader) {
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
	if (!this.visibility) //should this also be inheriting?
		return;

	this.texture.bindTo(this.gl.TEXTURE0);
	this.shadow.bindTo(this.gl.TEXTURE1);

	this.gl.uniformMatrix4fv(shader.getUniform('M'), false, this.getTransformation()); //write model transformation
	this.gl.uniform1i(shader.getUniform('texture'), 0);
	this.gl.uniform1i(shader.getUniform('shadowTexture'), 1);
	Sprite.MESH.bindToVAO(shader.getAttrib('position'), shader.getAttrib('texCoord'));
	Sprite.MESH.draw();

}

let GameObject = function(gl, spritePath, position, size) {
    this.position = position;
    this.halfSize = vec2.create();
    vec2.scale(this.halfSize, size, 0.5);

    let transform = mat4.create();
    mat4.fromRotationTranslationScale(transform, quat.create(), vec3.fromValues(position[0], position[1], 0), vec3.fromValues(size[0] / 2, size[1] / 2, 1));
    this.sprite = new Sprite(gl, spritePath, transform, null);
}

GameObject.prototype.setPosition = function(position) {
    this.position = position;
    let transform = mat4.create();
    mat4.fromTranslation(transform, vec3.fromValues(position[0], position[1], 0), null);
    this.setTransformation(transform);
}

GameObject.prototype.draw = function(shader) {
    this.sprite.draw(shader);
}

export {Sprite, GameObject}
