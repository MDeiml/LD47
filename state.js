
export let gl = null;
export let player = null;
export let level = {
    objects: [],
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

export function pickUp(item) {
	index = level.objects.indexOf(item);
	if (index > -1) {
		level.objects.splice(index, 1);
		inventory.objects.push(item);
	}
}

// Currently not needed
export function layDown(item) {
	index = inventory.objects.indexOf(item);
	if (index > -1) {
		inventory.objects.splice(index, 1);
		level.objects.push(item);
	}
}
