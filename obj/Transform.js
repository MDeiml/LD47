import {mat4, vec3} from "../gl-matrix-min.js"

export let Projection = function(aspectRatio)
{
	this.updateAspect(aspectRatio);
}

Projection.prototype.updateAspect = function(aspectRatio) {
	this.mat = mat4.create();
	mat4.ortho(this.mat, -aspectRatio, aspectRatio, -1, 1, -1, 1);
	let zoom = 0.15;
	mat4.scale(this.mat, this.mat, vec3.fromValues(zoom, zoom, zoom));
	mat4.mul(this.mat, this.mat,
		mat4.fromValues(1, 0, 0, 0,
						0, 1, 0, 0,
						0, 1, 1, 0,
						0, 0, 0, 1)); // what is this matrix multiplication????
}
Projection.prototype.get = function() {
	return this.mat;
}

export let View = function(pos) {
    this.pos = vec3.clone(pos);
    this.mat = mat4.create();
    mat4.fromTranslation(this.mat, vec3.fromValues(-pos[0], -pos[1], 0));
}

View.prototype.setPos = function(newPos) {
	vec3.copy(this.pos, newPos);
    mat4.fromTranslation(this.mat, vec3.fromValues(-newPos[0], -newPos[1], 0));
}

View.prototype.get = function() {
	return this.mat;
}

