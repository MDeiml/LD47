import {Sprite} from "./obj/Sprite.js"
import {gl, inventory, level, inventoryItemTransform, updateRegistry} from "./state.js"
import { mat4, vec3, quat } from "./gl-matrix-min.js"


let ITEM_SPRITES = {
	10 : "assets/lvl1/kids-drawing.png",
	11 : "assets/lvl1/love-letter.png",
	12 : "assets/lvl1/love-you.png",
	13 : "assets/lvl1/Pocket-Watch.png",
	14 : "assets/lvl1/home-sweet-home.png",
	
	//level 2 items
	20 : "assets/lvl2/Ring_poliert_Blickdicht.png",
	21 : "assets/lvl2/Diary_entry.png",
	22 : "assets/lvl2/mailbox_lv2.png",
	23 : "assets/lvl2/Photos_von_freunden.png",
	24 : "assets/lvl2/sticky_note.png",
	
	30 : "assets/lvl3/Medical_Record.png"
};

let ITEM_SPRITE_FRAMES = {
	10 : 1,
	11 : 1,
	12 : 1,
	13 : 1,
	14 : 1,
	10 : 1,
	21 : 1,
	22 : 2,
	23 : 1,
	23 : 1,
	30 : 1
}



function itemFadeAnim(sprite, name, tgtPos, tgtScale, frames) {
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
	
	if (this.cnt > frames) {
		updateRegistry.unregisterUpdate(name);
		mat4.fromRotationTranslationScale(sprite.transform, quat.create(), this.strtPos, this.strtScale);
	}
}

export function getItemSprite(id, transformation, parent, animate) {
	let sprite = new Sprite(ITEM_SPRITES[id], transformation, parent)
	sprite.texture.frames = ITEM_SPRITE_FRAMES[id]
	return sprite
}

export function pickUp(item) {
	let index = level.objects.indexOf(item);
	if (index > -1) {
        item.type = "deco";
        let transform = inventoryItemTransform(inventory.objects.length);
		let sprite = getItemSprite(item.pickup, transform, null, false);
        inventory.objects.push(sprite);
		let m = mat4.create();
        mat4.fromScaling(m, vec3.fromValues(0.5, 0.5, 1));
        inventory.postits.push(new Sprite("assets/dull_sticky_bitch.png", mat4.mul(m, transform, m)));
	}
}
