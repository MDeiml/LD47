import { SOUND_LIST } from './registry.js';
import { vec3 } from './gl-matrix-min.js'

let sounds = {}

export let PositionalAudio = function(pos, name, loop) {
	this.name = name;
	sounds[name] = this; //register globally
	
	this.sound = new Audio(name);
	
	if (loop)
		this.sound.loop = true;
	
	this.pos = vec3.clone(pos);
}

PositionalAudio.prototype.play = function() { this.sound.play(); }
PositionalAudio.prototype.pause = function() { this.sound.pause(); }
PositionalAudio.prototype.stop = function() {
	this.sound.pause();
	this.sound.currentTime = 0;
}
PositionalAudio.prototype.update = function(listenPos) {
    this.sound.volume = 1 / Math.max(1, vec3.dist(listenPos, this.pos));
}
PositionalAudio.prototype.moveTo = function(newPos) {
	vec3.copy(this.pos, newPos);
}
PositionalAudio.prototype.move = function(trans) {
	vec3.add(this.pos, this.pos, trans);
}

//more audio source types with their own behavior

export function initAudio() {
	
	for (let sound of SOUND_LIST)
		sounds[sound] = new Audio(sound);
	
}

export function updateAudio(listener) {
	
	for (let soundID in sounds)
		if (typeof sounds[soundID].update === "function")
			sounds[soundID].update(listener);
	
}
