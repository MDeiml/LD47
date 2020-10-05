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

export function menuLeft() {
	return keyDown("KeyA") || keyDown("ArrowLeft");
}

export function menuRight() {
	return keyDown("KeyD") || keyDown("ArrowRight");
}

export function menuUp() {
	return keyDown("KeyW") || keyDown("ArrowUp");
}

export function menuDown() {
	return keyDown("KeyS") || keyDown("ArrowDown");
}

export function jumping() {
    return keyDown("Space") || keyDown("ArrowUp");
}

export function holdingJump() {
    return key("Space") || key("ArrowUp");
}

export function pickingUp() {
	let ret = keyDown("KeyE");
    lastKeys["KeyE"] = true;
    return ret;
}

export function toggleInventory() {
    return keyDown("Tab");
}
