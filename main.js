import { init as initGraphics, update as updateGraphics, projection, updateView } from "./render.js"
import {mat4, vec3, vec2} from "./gl-matrix-min.js"
import {update as updatePhysics} from "./physics.js"
import { init as initInput, update as updateInput, toggleInventory, menuUp, menuDown, menuLeft, menuRight} from "./input.js"
import {gl, player, level, menu, setPlayer, inventory, INVENTORY_HEIGHT, INVENTORY_WIDTH} from "./state.js"
import {GameObject} from "./obj/Sprite.js";
import {loadLevel} from "./level.js"

//timekeeper
var lastTick = null;
var unprocessed = 0;
const FRAME_TIME = 1000/60;
let frameCntr = 0

function main() {
    initGraphics(document.getElementById('glCanvas'));
    initInput();

    // TODO: Change this
    setPlayer(new GameObject("./assets/walk_circle.png", vec2.fromValues(0, 0), vec2.fromValues(1, 1), "player", vec2.fromValues(3.5, 3.5), vec2.fromValues(0, 0.9)), true);
    player.velocity = vec2.fromValues(0, 0);
    player.onGround = false;
	player.sprite.texture.frames = 4;

    window.running = true;
    requestAnimationFrame(update);

	loadLevel(0, gl)
}

function updatePlayerAnimation() {
	frameCntr += 1;
	if ((frameCntr % 15) === 0) {
		frameCntr = 0;
		player.sprite.texture.nextFrame();
	}
}

function update(now) {
    if (!lastTick) {
        lastTick = now;
    }

    unprocessed += now - lastTick;
    lastTick = now;

    if (unprocessed >= 1000) {
        // this means game has probably stopped running (e.g. computer was turned off)
		// TODO force game state into pause
        unprocessed = 0;
    }

    let shouldRender = false;
    while (unprocessed >= FRAME_TIME) {
        unprocessed -= FRAME_TIME;
        shouldRender = true;
        updateInput();
        if (toggleInventory()) {
            inventory.opened = !inventory.opened;
            inventory.cursorPosition = 0;
        }
        if (menu.sprite !== null) {
            menu.cooldown -= FRAME_TIME / 1000;
            if (menu.cooldown < 0) {
                menu.sprite = null;
            }
        } else if (inventory.opened) {
            updateInventory();
        } else {
            updatePhysics(FRAME_TIME / 1000);
			updateView();
			updatePlayerAnimation();
        }
    }

    // don't render if there was no update
    if (shouldRender) {
        updateGraphics();
    }

    if (window.running) {
        requestAnimationFrame(update);
    }
}

function updateInventory() {
    if (menuRight()) {
        inventory.cursorPosition += 1;
    }
    if (menuLeft()) {
        inventory.cursorPosition -= 1;
    }
    if (menuDown()) {
        inventory.cursorPosition += INVENTORY_WIDTH;
    }
    if (menuUp()) {
        inventory.cursorPosition -= INVENTORY_WIDTH;
    }
    inventory.cursorPosition = (inventory.cursorPosition + INVENTORY_WIDTH * INVENTORY_HEIGHT) % (INVENTORY_WIDTH * INVENTORY_HEIGHT);
}

main();
