import { init as initGraphics, update as updateGraphics, projection, sprites } from "./render.js"
import {mat4, vec3} from "../gl-matrix-min.js"

//timekeeper
var lastTick = null;
var unprocessed = 0;
const FRAME_TIME = 60/1000;

const FRAME_ROT = 0.001/Math.PI;
let delta = 0;


function main() {
    initGraphics(document.getElementById('glCanvas'));

    window.running = true;
    requestAnimationFrame(update);
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
		
		delta += FRAME_ROT;
    }

    // don't render if there was no update
    if (shouldRender) {
        updateGraphics();
		
		//THIS IS A TEST SYSTEM FOR ANIMATION. NOT ACTUALLY RELEVANT CODE
		let transMat = mat4.create();
		mat4.fromRotation(transMat, delta, vec3.fromValues(0, 0, 1));
		for (let sprite of sprites)
			sprite.setTransformation(transMat);
    }

    if (window.running) {
        requestAnimationFrame(update);
    }
}



main();