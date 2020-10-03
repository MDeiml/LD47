let currentKeys = [];
let nextKeys = [];

export function init() {
    document.addEventListener("keydown", function(event) {
        nextKeys[event.code] = true;
    });
    document.addEventListener("keyup", function(event) {
        delete nextKeys[event.code];
    });
}

export function update() {
    currentKeys = Object.assign({}, nextKeys);
}

function keyDown(code) {
    return code in currentKeys;
}

export function walkingLeft() {
	return keyDown("KeyA") || keyDown("ArrowLeft");
}

export function walkingRight() {
	return keyDown("KeyD") || keyDown("ArrowRight");
}