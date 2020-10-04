import { mat4, vec3, quat } from "./gl-matrix-min.js"
import { Sprite } from "./obj/Sprite.js"

export let gl = null;
export let player = null;
export let level = {
    objects: [],
	lights: new Array(180),
	updateLight: function(lightID, color, pos, dir, cutoff, intensity) {
		let startPos = lightID * 9;
		
		this.lights[startPos] = color[0]
		this.lights[startPos + 1] = color[1]
		this.lights[startPos + 2] = color[2]
		
		this.lights[startPos + 3] = pos[0]
		this.lights[startPos + 4] = pos[1]
		
		this.lights[startPos + 5] = dir[0]
		this.lights[startPos + 6] = dir[1]
		
		this.lights[startPos + 7] = cutoff
		
		this.lights[startPos + 8] = intensity
	}

};
export let menu = {
    sprite: null,
	backgroundContainer: null,
    cooldown: 0
};

export function setGl(context) {
    gl = context;
}

export function setPlayer(obj) {
    player = obj;
}
export let inventory = {
    opened: false,
    level_end: false,
    cursorPosition: 0,
	objects: [],
    postits: []
};
export let updateRegistry = {
	updateList : {},
	registerUpdate : function(name, callback) {
		this.updateList[name] = callback;
	},
	unregisterUpdate : function(name) {
		delete this.updateList[name];
	},
	update : function(delta) {
		for (let updateName in this.updateList)
			this.updateList[updateName](delta);
	},
}


const INVENTORY_SIZE = 6;
export const INVENTORY_HEIGHT = 5;
export const INVENTORY_WIDTH = 9;
const INVENTORY_SCALE = INVENTORY_SIZE / INVENTORY_HEIGHT;

export function inventoryItemTransform(index) {
    let x = index % INVENTORY_WIDTH;
    let y = Math.floor(index / INVENTORY_WIDTH);
    let pos = vec3.fromValues((x + 0.5) * INVENTORY_SCALE - INVENTORY_SCALE * INVENTORY_WIDTH / 2, INVENTORY_SIZE / 2 - (y + 0.5) * INVENTORY_SCALE, 0);
    let scale = vec3.fromValues(INVENTORY_SCALE, INVENTORY_SCALE, INVENTORY_SCALE);

    let transform = mat4.create();
    mat4.fromRotationTranslationScale(transform, quat.create(), pos, scale);
    return transform;
}
