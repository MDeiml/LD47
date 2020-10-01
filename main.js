import { init as initGraphics, update as updateGraphics } from "./render.js"

//timekeeper
var lastTick = null
var unprocessed = 0
const FRAME_TIME = 60/1000

function main() {
    initGraphics(document.getElementById('glCanvas'));

    window.running = true;
    requestAnimationFrame(update);
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    window.addEventListener('fullscreenchange', resize);
}

function resize(event) {	
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