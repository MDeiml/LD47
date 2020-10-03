let lastKeys = {};
let currentKeys = {};
let nextKeys = {};

export function init() {
    document.addEventListener("keydown", function(event) {
        nextKeys[event.code] = true;
        if (event.code == "Tab") {
            event.preventDefault();
        }
    });
    document.addEventListener("keyup", function(event) {
        delete nextKeys[event.code];
        if (event.code == "Tab") {
            event.preventDefault();
        }
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
    return keyDown("Space") || keyDown("ArrowUp");
}

export function pickingUp() {
	return keyDown("KeyE");
}

export function toggleInventory() {
    return keyDown("Tab");
}
