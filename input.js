let lastKeys = {};
let currentKeys = {};
let nextKeys = {};

export function init() {
    document.addEventListener("keydown", function(event) {
        nextKeys[event.code] = true;
    });
    document.addEventListener("keyup", function(event) {
        delete nextKeys[event.code];
    });
}

export function update() {
    lastKeys = Object.assign({}, currentKeys);
    currentKeys = Object.assign({}, nextKeys);
}

function key(code) {
    return code in currentKeys;
}

function keyDown(code) {
    return code in currentKeys && !(code in lastKeys);
}

export function walkingLeft() {
	return key("KeyA") || key("ArrowLeft");
}

export function walkingRight() {
	return key("KeyD") || key("ArrowRight");
}

export function jumping() {
    return keyDown("Space");
}

export function pickingUp() {
	return keyDown("KeyE");
}