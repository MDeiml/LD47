import { mat4, vec3, quat } from "./gl-matrix-min.js"
import { Sprite } from "./obj/Sprite.js"

export let gl = null;
export let player = null;
export let level = {
    objects: [],
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
    cursorPosition: 0,
	objects: [],
};

// TODO: Find a better place for this
export let itemSprites = {
    0: "assets/Ring_poliert_Blickdicht.png"
};

export function pickUp(item) {
	let index = level.objects.indexOf(item);
	if (index > -1) {
		level.objects.splice(index, 1);
        for (let i = 0; i < 40; i++) {
            let transform = inventoryItemTransform(inventory.objects.length);
            // inventory.objects.push(new Sprite(itemSprites[item.pickup], transform));
            inventory.objects.push(new Sprite(itemSprites[item.pickup], transform));
        }
	}
	console.log(inventory);
}

const INVENTORY_SIZE = 6;
export const INVENTORY_HEIGHT = 5;
export const INVENTORY_WIDTH = 9;
const INVENTORY_SCALE = INVENTORY_SIZE / INVENTORY_HEIGHT;

function inventoryItemTransform(index) {
    let x = index % INVENTORY_WIDTH;
    let y = Math.floor(index / INVENTORY_WIDTH);
    let pos = vec3.fromValues((x + 0.5) * INVENTORY_SCALE - INVENTORY_SCALE * INVENTORY_WIDTH / 2, INVENTORY_SIZE / 2 - (y + 0.5) * INVENTORY_SCALE, 0);
    let scale = vec3.fromValues(INVENTORY_SCALE, INVENTORY_SCALE, INVENTORY_SCALE);

    let transform = mat4.create();
    mat4.fromRotationTranslationScale(transform, quat.create(), pos, scale);
    return transform;
}
