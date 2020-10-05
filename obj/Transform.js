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
    this.upsideDown = false;
    mat4.fromTranslation(this.mat, vec3.fromValues(-pos[0], -pos[1], 0));
}

View.prototype.setUpsideDown = function(upsideDown) {
    this.upsideDown = upsideDown;
    mat4.fromTranslation(this.mat, vec3.fromValues(-this.pos[0], -this.pos[1], 0));
    if (this.upsideDown) {
        let m = mat4.fromScaling(mat4.create(), vec3.fromValues(-1, -1, 1));
        mat4.mul(this.mat, m, this.mat);
    }
}

View.prototype.setPos = function(newPos) {
	vec3.copy(this.pos, newPos);
    mat4.fromTranslation(this.mat, vec3.fromValues(-this.pos[0], -this.pos[1], 0));
    if (this.upsideDown) {
        let m = mat4.fromScaling(mat4.create(), vec3.fromValues(-1, -1, 1));
        mat4.mul(this.mat, m, this.mat);
    }
}

View.prototype.get = function() {
	return this.mat;
}

