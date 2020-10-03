import * as Shader from "./obj/Shader.js"
import * as Sprite from "./obj/Sprite.js"
import {Projection, View} from "./obj/Transform.js"
import { SPRITE_LIST } from "./registry.js"
import {mat4, vec2, vec3} from "./gl-matrix-min.js"
import {level, player, gl, setGl, menu, inventory} from "./state.js"

let shaders = {};

export let projection = null;
let camera = null;
let cameraLeftFixed = true;
let updateViewMat = false;
let pvMatrix = mat4.create();
//render state
let lighting = 0;
//move to global state in some way
let w = 0;
let h = 0;

//TODO add texture construction

export function init(c) {
	let canvas = c;
	w = canvas.clientWidth;
	h = canvas.clientHeight;
	canvas.width = w;
	canvas.height = h;
    setGl(canvas.getContext("webgl"));
	gl.clearColor(0, 0, 0, 1);
	gl.frontFace(gl.CCW);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	initShaders();

	camera = new View(vec2.fromValues(0, 0));
	projection = new Projection(w/h);
	updateViewMat = true;


	for (let sprite of SPRITE_LIST)
	{
		sprites.push(new Sprite.Sprite(gl, sprite));
	}


    window.addEventListener('resize', updateProjection);
    window.addEventListener('orientationchange', updateProjection);
    window.addEventListener('fullscreenchange', updateProjection);

    inventory.board = new Sprite.Sprite("assets/Inventar_Board.png", mat4.fromScaling(mat4.create(), vec3.fromValues(8, 8, 8)));
    inventory.glowingPostit = new Sprite.Texture2D("assets/Glowing_sticky_Bitch.png");
    inventory.postit = new Sprite.Texture2D("assets/dull_sticky_bitch.png");

}

function initShaders(name) {

	shaders["defaultShader"] = new Shader.Shader(gl, "shader")

	shaders["defaultShader"].bind();
    let defaultPositionAttribute = gl.getAttribLocation(shaders["defaultShader"].get(), 'position');
    let defaultTexCoordAttribute = gl.getAttribLocation(shaders["defaultShader"].get(), 'texCoord');

    gl.enableVertexAttribArray(defaultPositionAttribute);
    gl.enableVertexAttribArray(defaultTexCoordAttribute);

}

export function updateView() {
	if (player.position[0] < 0) {
		if (!cameraLeftFixed) {
			cameraLeftFixed = true;
			updateViewIntern(0, 0);
		}
	} else {
		updateViewIntern(vec2.fromValues(player.position[0], 0));
	}
}

function updateViewIntern(pos) {
	updateViewMat = true;
	camera.setPos(pos);
}
function updateProjection() {
    let w = gl.canvas.clientWidth;
    let h = gl.canvas.clientHeight;
    gl.canvas.width = w;
    gl.canvas.height = h;
    gl.viewport(0, 0, w, h);
    projection.updateAspect(w/h);

	updateViewMat = true;
}

export function update() {
    gl.clear(gl.COLOR_BUFFER_BIT);

	if (updateViewMat) {
		mat4.identity(pvMatrix);
		mat4.mul(pvMatrix, projection.get(), camera.get());
		updateViewMat = false;
	}

	drawBaseShader();
    drawGUI();

	gl.flush();
}

function drawGUI() {

	gl.uniformMatrix4fv(shaders["defaultShader"].getUniform('VP'), false, projection.get());

    if (menu.sprite != null) {
        menu.sprite.draw(shaders["defaultShader"]);
    } else if (inventory.opened) {
        inventory.board.draw(shaders["defaultShader"]);
        for (let i = 0; i < inventory.objects.length; i++) {
            if (inventory.cursorPosition == i) {
                inventory.postits[i].texture = inventory.glowingPostit;
            } else {
                inventory.postits[i].texture = inventory.postit;
            }
            inventory.postits[i].draw(shaders["defaultShader"]);
            inventory.objects[i].draw(shaders["defaultShader"]);
        }
    }
}

function drawBaseShader() {
	shaders["defaultShader"].bind();

	gl.uniformMatrix4fv(shaders["defaultShader"].getUniform('VP'), false, pvMatrix);

	for (let sprite of level.objects)
		sprite.draw(shaders["defaultShader"]);

    player.draw(shaders["defaultShader"]);
}
