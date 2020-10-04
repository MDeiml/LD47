import {Sprite} from "./obj/Sprite.js"
import {gl, inventory, level, inventoryItemTransform, updateRegistry} from "./state.js"
import { mat4, vec3, quat } from "./gl-matrix-min.js"


let ITEM_SPRITES = {
    0: "assets/lv2/Ring_poliert_Blickdicht.png",
    1: "assets/lv2/Diary_entry.png",
    2: "assets/lv2/mailbox_lv2.png",
    3: "assets/lv2/Photos_von_freunden.png",
	4: "assets/lv2/sticky_note.png"
};

let ITEM_SPRITE_FRAMES = {
	0 : 1,
	1 : 1,
	2 : 2,
	3 : 1,
	4 : 1
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
	let updateFunc = itemFadeAnim.bind(new Object(), sprite, "fade_anim_"+id, vec3.fromValues(10, -10, 0), vec3.fromValues(0, 0, 0), 40)
	updateFunc()
	if(animate)
		updateRegistry.registerUpdate("fade_anim_"+id, updateFunc);
	
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
