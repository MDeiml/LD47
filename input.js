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

export function keyDown(code) {
    return code in currentKeys;
}
