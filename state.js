
export let gl = null;
export let player = null;
export let level = {
    objects: [],
};
export let menu = {
    sprite: null,
    cooldown: 0
};

export function setGl(context) {
    gl = context;
}

export function setPlayer(obj) {
    player = obj;
}
export let inventory = {
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
		inventory.objects.push(item);
	}
	console.log(inventory);
}

// Currently not needed
export function layDown(item) {
	let index = inventory.objects.indexOf(item);
	if (index > -1) {
		inventory.objects.splice(index, 1);
		level.objects.push(item);
	}
}
