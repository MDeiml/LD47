import {mat4, vec3, vec2, quat} from "../gl-matrix-min.js"
import {gl} from "../state.js"

const VERTEX_DIM = 3;
const UV_DIM = 2;

let texList = {};

export let Texture2D = function(path, resolution) {
	this.name = path;

	if (!this.name in Object.keys(texList)) {
		this.image = texList[this.name].image;
		this.tex = texList[this.name].tex;
	} else {
		this.tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		if (!resolution) {
			resolution = [512, 512];
		}
		this.image.width = resolution[0];
		this.image.height = resolution[1];
		this.image.onload = function () {
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

			gl.bindTexture(gl.TEXTURE_2D, this.tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			// gl.generateMipmap(gl.TEXTURE_2D); //should be done after setting clamping/filtering so that it can't encounter power of 2 issues
		}.bind(this);
		this.image.src = path;

		texList[this.name] = this;
	}

}

Texture2D.prototype.bindTo = function(position) {
	gl.activeTexture(position);
	gl.bindTexture(gl.TEXTURE_2D, this.tex);
}

export let DynamicTexture2D = function() {
	if (typeof(DynamicTexture2D.framebuffer) === "undefined")
		DynamicTexture2D.framebuffer = gl.createFramebuffer();

	this.tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.tex);

	//based on canvas this is optimal resolution but a nonstatic value forces reconstruction on resize :/
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2048, 2048/*gl.canvas.width, gl.canvas.height*/, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.bindFramebuffer(gl.FRAMEBUFFER, DynamicTexture2D.framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

DynamicTexture2D.prototype.bindFramebuffer = function() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, DynamicTexture2D.framebuffer);

	gl.clear(gl.COLOR_BUFFER_BIT);
}
DynamicTexture2D.prototype.unbindFramebuffer = function() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
DynamicTexture2D.prototype.bindTo = function(position) {
	gl.activeTexture(position);
	gl.bindTexture(gl.TEXTURE_2D, this.tex);
}


let Mesh = function(vertices, uv) {
	this.vertexCnt = Math.floor(vertices.length / VERTEX_DIM);
	this.uvCnt = Math.floor(uv.length / UV_DIM);

	//checking integrity of dataset
	if (vertices.length % VERTEX_DIM !== 0 || uv.length % UV_DIM !== 0)
		alert("Invalid mesh dataset. not able to divide array into vectors.");
	if (this.vertexCnt - this.uvCnt !== 0)
		alert("Count of UV and Vertex Coordinates don't match.");

	this.squareBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	this.squareTexCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareTexCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
}

Mesh.prototype.bindToVAO = function(positionAttrib, uvAttrib) {
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
	gl.vertexAttribPointer(positionAttrib, VERTEX_DIM, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareTexCoordBuffer);
	gl.vertexAttribPointer(uvAttrib, UV_DIM, gl.FLOAT, false, 0, 0);
}

Mesh.prototype.draw = function() {
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexCnt);
}

let Sprite = function(spritePath, transformation, parent) {
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

	this.texture.bindTo(gl.TEXTURE0);
	gl.uniformMatrix4fv(shader.getUniform('M'), false, this.getTransformation()); //write model transformation
	gl.uniform1i(shader.getUniform('texture'), 0);

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

	this.texture.bindTo(gl.TEXTURE0);
	this.shadow.bindTo(gl.TEXTURE1);

	gl.uniformMatrix4fv(shader.getUniform('M'), false, this.getTransformation()); //write model transformation
	gl.uniform1i(shader.getUniform('texture'), 0);
	gl.uniform1i(shader.getUniform('shadowTexture'), 1);
	Sprite.MESH.bindToVAO(shader.getAttrib('position'), shader.getAttrib('texCoord'));
	Sprite.MESH.draw();

}

let GameObject = function(spritePath, position, size) {
    this.position = position;
    this.halfSize = vec2.create();
    vec2.scale(this.halfSize, size, 0.5);

    let transform = mat4.create();
    mat4.fromRotationTranslationScale(transform, quat.create(), vec3.fromValues(position[0], position[1], 0), vec3.fromValues(this.halfSize[0], this.halfSize[1], 1));
    this.sprite = new Sprite(gl, spritePath, transform, null);
}

GameObject.prototype.setPosition = function(position) {
    this.position = position;
    let transform = mat4.create();
    mat4.fromRotationTranslationScale(transform, quat.create(), vec3.fromValues(position[0], position[1], 0), vec3.fromValues(this.halfSize[0], this.halfSize[1], 1));
    this.sprite.setTransformation(transform);
}

GameObject.prototype.draw = function(shader) {
    this.sprite.draw(shader);
}

export {Sprite, GameObject}
