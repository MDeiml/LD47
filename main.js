import { init as initGraphics, update as updateGraphics, projection, sprites } from "./render.js"
import {mat4, vec3, vec2} from "./gl-matrix-min.js"
import {update as updatePhysics} from "./physics.js"
import { init as initInput, update as updateInput} from "./input.js"
import {gl, player, level, setPlayer} from "./state.js"
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
    level.objects.push(new GameObject("./Jabba.webp", vec2.fromValues(4, 0), vec2.fromValues(2, 2), "collidable"));

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
        updatePhysics(FRAME_TIME / 1000);
    }

	if (!level.isInitialized)
	{
		for (let entry of level.objects)
			sprites.push(entry)
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
