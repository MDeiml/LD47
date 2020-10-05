import {Sprite} from "./obj/Sprite.js"
import {gl, inventory, level, inventoryItemTransform, updateRegistry} from "./state.js"
import { mat4, vec3, quat } from "./gl-matrix-min.js"


let ITEM_SPRITES = {
	10 : "assets/lvl1/kids-drawing.png",
	11 : "assets/lvl1/love-letter.png",
	12 : "assets/lvl1/love-you.png",
	13 : "assets/lvl1/Pocket_Watch.png",
	14 : "assets/lvl1/home-sweet-home.png",

	//level 2 items
	20 : "assets/lvl2/Ring_poliert_Blickdicht.png",
	21 : "assets/lvl2/Diary_entry.png",
	22 : "assets/lvl2/mailbox.png",
	23 : "assets/lvl2/Photos_von_freunden.png",
	24 : "assets/lvl2/sticky_note.png",

	30 : "assets/lvl3/Medical_Record.png"
};

export let ITEM_SOUNDS = {
	14 : "assets/voicemail_test.ogg"
};

let ITEM_TRIGGER = {
	22 : {
		open: function() {
			 if (typeof sprite.sound !== "undefined")
				 sprite.sound.play()
			 sprite.texture.setFrame(1)
		},
		close : function() {
			if (typeof sprite.sound !== "undefined")
				sprite.sound.pause()
			 sprite.texture.setFrame(0)
		}
	}
};

let ITEM_SPRITE_FRAMES = {
	22 : 2
}

export function getItemSprite(id, transformation, parent, animate) {
	let sprite = new Sprite(ITEM_SPRITES[id], transformation, parent)
	sprite.item_id = id
	if (typeof ITEM_SPRITE_FRAMES[id] !== "undefined")
		sprite.texture.frames = ITEM_SPRITE_FRAMES[id]
	
	if (typeof ITEM_SOUNDS[id] !== "undefined")
		sprite.sound = new Audio(ITEM_SOUNDS[id])
	
	if (typeof ITEM_TRIGGER[id] !== "undefined") {
		sprite.onOpen = ITEM_TRIGGER[id].open.bind(sprite)
		sprite.onClose = ITEM_TRIGGER[id].close.bind(sprite)
	}
	else {
		sprite.onOpen = function() { if (typeof sprite.sound !== "undefined") sprite.sound.play()}
		sprite.onClose = function() { if (typeof sprite.sound !== "undefined") sprite.sound.pause()}
	}
	
	return sprite
}

export function pickUp(item) {
	let index = level.objects.indexOf(item);
	if (index > -1) {
        level.objects.splice(index, 1);
        let transform = inventoryItemTransform(inventory.objects.length);
		let sprite = getItemSprite(item.pickup, transform, null, false);
        inventory.objects.push(sprite);
		let m = mat4.create();
        mat4.fromScaling(m, vec3.fromValues(0.5, 0.5, 1));
        inventory.postits.push(new Sprite("assets/dull_sticky_bitch.png", mat4.mul(m, transform, m)));
	}
}
