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
	setSprite: function(sprite, disableAnimation = false) {
		if (sprite !== null)
		{
			mat4.fromRotationTranslationScale(sprite.transform, quat.create(), vec3.fromValues(10, -10, 0), vec3.fromValues(0, 0, 0));
	
			let updateInFunc = itemFadeInAnim.bind(new Object(), sprite, "fade_in_anim_"+sprite.texture.name, vec3.fromValues(0, 0, 0), vec3.fromValues(5, 5, 5), 40)
			updateInFunc()
			if(!disableAnimation) {
				updateRegistry.registerUpdate("fade_in_anim_"+sprite.texture.name, updateInFunc);
			}
		}
		
		if (this.sprite !== null)
		{
			let updateOutFunc = itemFadeOutAnim.bind(new Object(), this.sprite, sprite, "fade_out_anim_"+this.sprite.texture.name, vec3.fromValues(10, -10, 0), vec3.fromValues(0, 0, 0), 40)
			updateOutFunc()
	
			if(!disableAnimation) {
				updateRegistry.registerUpdate("fade_out_anim_"+this.sprite.texture.name, updateOutFunc);
			}
		}
		else{
			this.sprite = sprite
		}
		
	},
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


function itemFadeInAnim(sprite, name, tgtPos, tgtScale, frames) {
	if (typeof this.cnt === "undefined")
		this.cnt = 0;
	else
		this.cnt += 1;
	
	if (typeof this.strtPos === "undefined")
	{
		this.strtPos = vec3.create();
		mat4.getTranslation(this.strtPos, sprite.transform);
	}
	if (typeof this.strtScale === "undefined")
	{
		this.strtScale = vec3.create();
		mat4.getScaling(this.strtScale, sprite.transform);
	}
	
	let pos = vec3.create()
	vec3.lerp(pos, this.strtPos, tgtPos, this.cnt/frames)
	let scale = vec3.create()
	vec3.lerp(scale, this.strtScale, tgtScale, this.cnt/frames)
	
	mat4.fromRotationTranslationScale(sprite.transform, quat.create(), pos, scale);
	
	if (this.cnt >= frames) {
		updateRegistry.unregisterUpdate(name);
		mat4.fromRotationTranslationScale(sprite.transform, quat.create(), tgtPos, tgtScale);
	}
}

function itemFadeOutAnim(sprite, newSprite, name, tgtPos, tgtScale, frames) {
	if (typeof this.cnt === "undefined")
		this.cnt = 0;
	else
		this.cnt += 1;
	
	if (typeof this.strtPos === "undefined")
	{
		this.strtPos = vec3.create();
		mat4.getTranslation(this.strtPos, sprite.transform);
	}
	if (typeof this.strtScale === "undefined")
	{
		this.strtScale = vec3.create();
		mat4.getScaling(this.strtScale, sprite.transform);
	}
	
	let pos = vec3.create()
	vec3.lerp(pos, this.strtPos, tgtPos, this.cnt/frames)
	let scale = vec3.create()
	vec3.lerp(scale, this.strtScale, tgtScale, this.cnt/frames)
	
	mat4.fromRotationTranslationScale(sprite.transform, quat.create(), pos, scale);
	
	if (this.cnt >= frames) {
		updateRegistry.unregisterUpdate(name);
		mat4.fromRotationTranslationScale(sprite.transform, quat.create(), this.strtPos, this.strtScale);
		menu.sprite = newSprite;
	}
}
