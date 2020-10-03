
export let player = null;
export let level = {
    objects: [],
};
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

export function layDown(item) {
	index = inventory.objects.indexOf(item);
	if (index > -1) {
		inventory.objects.splice(index, 1);
		level.objects.push(item);
	}
}