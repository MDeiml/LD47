import { vec2 } from './gl-matrix-min.js'

let sounds = {}

export let walk_wood = null;

export let PositionalAudio = function(pos, name, loop) {
	this.name = name;
	sounds[name] = this; //register globally

	this.sound = new Audio(name);

	if (loop)
		this.sound.loop = true;

	this.pos = vec2.clone(pos);
}

PositionalAudio.prototype.play = function() { this.sound.play(); }
PositionalAudio.prototype.pause = function() { this.sound.pause(); }
PositionalAudio.prototype.stop = function() {
	this.sound.pause();
	this.sound.currentTime = 0;
}
PositionalAudio.prototype.update = function(listenPos) {
    this.sound.volume = 1 / Math.max(1, vec2.dist(listenPos, this.pos));
}
PositionalAudio.prototype.moveTo = function(newPos) {
	vec2.copy(this.pos, newPos);
}
PositionalAudio.prototype.move = function(trans) {
	vec2.add(this.pos, this.pos, trans);
}

export function initAudio() {
    walk_wood = new PositionalAudio(vec2.create(), "assets/walk_wood.ogg", true);
}

export function updateAudio(listener) {

	for (let soundID in sounds)
		if (typeof sounds[soundID].update === "function")
			sounds[soundID].update(listener);

}
