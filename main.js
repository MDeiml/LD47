import { init as initGraphics, update as updateGraphics, projection, updateView } from "./render.js"
import {mat4, vec3, vec2} from "./gl-matrix-min.js"
import {update as updatePhysics} from "./physics.js"
import { init as initInput, update as updateInput, toggleInventory, menuUp, menuDown, menuLeft, menuRight, pickingUp} from "./input.js"
import {gl, player, level, menu, setPlayer, inventory, INVENTORY_HEIGHT, INVENTORY_WIDTH, inventoryItemTransform, updateRegistry} from "./state.js"
import {GameObject, Sprite} from "./obj/Sprite.js";
import {loadLevel} from "./level.js"
import {init as initResource} from "./resource.js"
import {getItemSprite} from "./item.js"
import {updateAudio, initAudio, music} from "./audio.js"

//timekeeper
var lastTick = null;
var unprocessed = 0;
const FRAME_TIME = 1000/60;
let frameCntr = 0
let framePos = 0
let eyeFrameCntr = 0
let eyeFramePos = 0

let MIN_FIRE_SCALE = 1.0
let MAX_FIRE_SCALE = 3.0
let fireCntr = 0
let firePos = 0
let dir = true

function main() {
    initGraphics(document.getElementById('glCanvas'));
    initInput();
    initAudio();

    initResource(function() {
        loadLevel(6)

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
	if (player.onGround) {
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

	if (player.canInteract) {
		eyeFrameCntr += 1;
		if ((eyeFrameCntr % 8) === 0 && eyeFramePos < 4) {
			eyeFrameCntr = 0;
			eyeFramePos += 1;
			player.eyeSprite.texture.setFrame(eyeFramePos);
		}
	}
	else {
		eyeFramePos = 0;
		eyeFrameCntr = 0;
	}
}
function updateFires() {
	fireCntr += 1;
	if ((fireCntr % 120) === 0) {
		fireCntr = 0;
		if (firePos === 0)
			firePos = 1
		else if (firePos === 1)
			if (dir)
				firePos = 2
			else
				firePos = 0
		else
			firePos = 0
	}
	for (let sprite of level.objects) {
		if (sprite.type !== "fire")
			continue

		sprite.setSize(vec2.fromValues(1, firePos + 1))
		sprite.sprite.texture.setFrame(firePos)
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
		updateRegistry.update();
        if (!inventory.level_end && toggleInventory()) {
            inventory.opened = !inventory.opened;
            inventory.cursorPosition = 0;
        }
        if (menu.sprite !== null) {
            if (menu.cooldown == -1) {
                if (pickingUp()) {
                    if (music.paused) {
                        music.play();
                    }
                    menu.setSprite(null);
                }
            } else {
                menu.cooldown -= FRAME_TIME / 1000;
                if (menu.cooldown < 0) {
                    menu.setSprite(null);
                }
            }
        } else if (inventory.opened) {
            updateInventory();
        } else {
            updatePhysics(FRAME_TIME / 1000);
			updateView();
			updatePlayerAnimation();

			updateFires();
        }
        updateAudio(player.position);
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
            inventory.postits.splice(level.id, inventory.objects.length - (level.id));
            item.setTransformation(inventoryItemTransform(inventory.objects.length));
            inventory.objects.push(item);

            inventory.level_end = false;
            inventory.opened = false;

            if (level.id < 7) {
                loadLevel(level.id + 1);
            } else {
                // TODO: proper ending
                loadLevel(1);
            }
        } else {
			if (typeof inventory.objects[inventory.cursorPosition] !== "undefined")
			{
				menu.setSprite(getItemSprite(inventory.objects[inventory.cursorPosition].item_id, mat4.fromScaling(mat4.create(), vec3.fromValues(5, 5, 5))));
				menu.cooldown = -1;
			}
        }
    }
}

main();
