
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
