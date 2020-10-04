import { init as initGraphics, update as updateGraphics, projection, updateView } from "./render.js"
import {mat4, vec3, vec2} from "./gl-matrix-min.js"
import {update as updatePhysics} from "./physics.js"
import { init as initInput, update as updateInput, toggleInventory, menuUp, menuDown, menuLeft, menuRight, pickingUp} from "./input.js"
import {gl, player, level, menu, setPlayer, inventory, INVENTORY_HEIGHT, INVENTORY_WIDTH, inventoryItemTransform} from "./state.js"
import {GameObject, Sprite} from "./obj/Sprite.js";
import {loadLevel} from "./level.js"
import {init as initResource} from "./resource.js"

//timekeeper
var lastTick = null;
var unprocessed = 0;
const FRAME_TIME = 1000/60;
let frameCntr = 0
let framePos = 0

function main() {
    initGraphics(document.getElementById('glCanvas'));
    initInput();

    initResource(function() {
        loadLevel(1)

        window.running = true;
        requestAnimationFrame(update);
    });
}

function playerFrameStepCnt(ticks) {
	const SPEED_DIFFERENCE = 0.25
	const PERIOD_INTERVAL = 15

	return SPEED_DIFFERENCE * Math.cos(Math.PI / PERIOD_INTERVAL * ticks) + 1 - SPEED_DIFFERENCE
}

function updatePlayerAnimation() {
	if (player.onGround)
		frameCntr += 1;
	if ((frameCntr % 15) === 0) {
		frameCntr = 0;
		if (vec2.length(player.velocity) > 0)
		{
			framePos += 1;
			if ((framePos % 4) === 0)
				framePos = 0;
			player.sprite.texture.setFrame(framePos);
		}
		else
			player.sprite.texture.setFrame(4)
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
        if (!inventory.level_end && toggleInventory()) {
            inventory.opened = !inventory.opened;
            inventory.cursorPosition = 0;
        }
        if (menu.sprite !== null) {
            if (menu.cooldown == -1) {
                if (pickingUp()) {
                    menu.sprite = null;
                }
            } else {
                menu.cooldown -= FRAME_TIME / 1000;
                if (menu.cooldown < 0) {
                    menu.sprite = null;
                }
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
    inventory.cursorPosition = (inventory.cursorPosition + inventory.objects.length) % inventory.objects.length;
    if (inventory.level_end) inventory.cursorPosition = Math.max(inventory.cursorPosition, level.id - 1);
    if (pickingUp()) {
        if (inventory.level_end) {

            let item = inventory.objects[inventory.cursorPosition];
            inventory.objects.splice(level.id - 1, inventory.objects.length - (level.id - 1));
            item.setTransformation(inventoryItemTransform(inventory.objects.length));
            inventory.objects.push(item);

            loadLevel(level.id + 1);
            inventory.level_end = false;
            inventory.opened = false;
        } else {
            menu.sprite = new Sprite(inventory.objects[inventory.cursorPosition].texture.name, mat4.fromScaling(mat4.create(), vec3.fromValues(5, 5, 5)));
            menu.cooldown = -1;
        }
    }
}

main();
