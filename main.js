import { init as initGraphics, update as updateGraphics, projection, updateView } from "./render.js"
import {mat4, vec3, vec2} from "./gl-matrix-min.js"
import {update as updatePhysics} from "./physics.js"
import { init as initInput, update as updateInput} from "./input.js"
import {gl, player, level, menu, setPlayer} from "./state.js"
import {GameObject} from "./obj/Sprite.js";
import {loadLevel} from "./level.js"

//timekeeper
var lastTick = null;
var unprocessed = 0;
const FRAME_TIME = 1000/60;


function main() {
    initGraphics(document.getElementById('glCanvas'));
    initInput();

    // TODO: Change this
    setPlayer(new GameObject("./Jabba.webp", vec2.fromValues(0, 0), vec2.fromValues(1, 1), "player"));
    player.velocity = vec2.fromValues(0, 0);
    player.onGround = false;

    window.running = true;
    requestAnimationFrame(update);

	loadLevel(0, gl)
}

function update(now) {
    if (!lastTick) {
        lastTick = now;
    }

    unprocessed += now - lastTick;
    lastTick = now;

    if (unprocessed >= 1000) {
        // this means game has probably stopped running (e.g. computer was turned off)
		//TODO force game state into pause
        unprocessed = 0;
    }

    let shouldRender = false;
    while (unprocessed >= FRAME_TIME) {
        unprocessed -= FRAME_TIME;
        shouldRender = true;
        updateInput();
        if (menu.sprite == null) {
            updatePhysics(FRAME_TIME / 1000);
        } else {
            menu.cooldown -= FRAME_TIME / 1000;
            if (menu.cooldown < 0) {
                menu.sprite = null;
            }
        }
		updateView();
    }

    // don't render if there was no update
    if (shouldRender) {
        updateGraphics();
    }

    if (window.running) {
        requestAnimationFrame(update);
    }
}



main();
