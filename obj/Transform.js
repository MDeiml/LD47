import {mat4, vec3} from "../gl-matrix-min.js"

export let Projection = function(aspectRatio)
{
	this.updateAspect(aspectRatio);
}

Projection.prototype.updateAspect = function(aspectRatio) {
	this.mat = mat4.create();
	mat4.ortho(this.mat, -aspectRatio, aspectRatio, -1, 1, -1, 1);
	mat4.scale(this.mat, this.mat, vec3.fromValues(0.02, 0.02, 0.02));
	mat4.mul(this.mat, this.mat,
		mat4.fromValues(1, 0, 0, 0,
						0, 1, 0, 0,
						0, 1, 1, 0,
						0, 0, 0, 1)); //what is this matrix multiplication????
}
Projection.prototype.get = function() {
	return this.mat;
}

export let View = function(pos, dir) {
	
	this.pos = vec3.clone(pos);
	
	//compute coordinate system from direction vector
	this.dir = vec3.create();
	this.up = vec3.create();
	this.right = vec3.create();
	vec3.normalize(this.dir, dir);
	vec3.cross(this.up, this.dir, vec3.fromValues(1, 0, 0));
	vec3.cross(this.right, this.up, this.right);
	
	this.mat = mat4.create();
	mat4.lookAt(this.mat, this.pos, this.dir, this.up);
	this.dirty = false;
}

View.prototype.translate = function(x, y, z) {
	vec3.copy(this.pos, newPos);
	this.dirty = true;
}
View.prototype.setPos = function(newPos) {
	vec3.copy(this.pos, newPos);
	this.dirty = true;
}
View.prototype.setDirection = function(dir) {
	vec3.normalize(this.dir, dir);
	vec3.cross(this.up, this.dir, vec3.fromValues(1, 0, 0));
	vec3.cross(this.right, this.up, this.right);
	this.dirty = true;
}
View.prototype.set = function(newPos, dir) {
	this.setPos(newPos);
	this.setDirection(dir);
}

View.prototype.get = function() {
	if(this.dirty) {
		mat4.lookAt(this.mat, this.pos, this.dir, this.up);
		this.dirty = false;
	}
	return this.mat;
}

export let View2D = new View(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 1));
//View2D.prototype.translate = function(x, y) {
//	View.translate.apply(this, x, y, 0)
//}
