import {Sprite} from "./obj/Sprite.js"
import {gl, inventory, level, inventoryItemTransform} from "./state.js"
import { mat4, vec3 } from "./gl-matrix-min.js"


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

export function getItemSprite(id, transformation, parent) {
	let sprite = new Sprite(ITEM_SPRITES[id], transformation)
	sprite.texture.frames = ITEM_SPRITE_FRAMES[id]
	return sprite
}

export function pickUp(item) {
	let index = level.objects.indexOf(item);
	if (index > -1) {
        item.type = "deco";
        let transform = inventoryItemTransform(inventory.objects.length);
        inventory.objects.push(getItemSprite(item.pickup, transform));
        let m = mat4.create();
        mat4.fromScaling(m, vec3.fromValues(0.5, 0.5, 1));
        inventory.postits.push(new Sprite("assets/dull_sticky_bitch.png", mat4.mul(m, transform, m)));
	}
}
