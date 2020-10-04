import * as Shader from "./obj/Shader.js"
import * as Sprite from "./obj/Sprite.js"
import {Projection, View} from "./obj/Transform.js"
import {mat4, vec2, vec3} from "./gl-matrix-min.js"
import {level, player, gl, setGl, menu, inventory} from "./state.js"

let shaders = {};

export let projection = null;
let camera = null;
let cameraLeftFixed = true;
let updateViewMat = false;
let pvMatrix = mat4.create();
//move to global state in some way
let w = 0;
let h = 0;

let lastSwitch = 0

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

	menu.backgroundContainer = new Sprite.Sprite(null, mat4.create(), null)
	menu.backgroundContainer.texture = new Sprite.DynamicTexture2D() //hackery but static, don't judge me
	menu.blurredBackgroundContainer = new Sprite.Sprite(null, mat4.create(), null)
	menu.blurredBackgroundContainer.texture = new Sprite.DynamicTexture2D() //hackery but static, don't judge me


    window.addEventListener('resize', updateProjection);
    window.addEventListener('orientationchange', updateProjection);
    window.addEventListener('fullscreenchange', updateProjection);

    inventory.board = new Sprite.Sprite("assets/Inventar_Board.png", mat4.fromScaling(mat4.create(), vec3.fromValues(8, 8, 8)));
    inventory.glowingPostit = new Sprite.Texture2D("assets/Glowing_sticky_Bitch.png");
    inventory.postit = new Sprite.Texture2D("assets/dull_sticky_bitch.png");

}

function initShaders(name) {

	shaders["defaultShader"] = new Shader.Shader("shader", "shader")
	shaders["lightShader"] = new Shader.Shader("shader", "light")
	shaders["blurShader"] = new Shader.Shader("shader", "blur")

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

	if (inventory.opened || menu.sprite !== null)
	{
		if (lastSwitch === 0)
		{
			lastSwitch = 1
			menu.backgroundContainer.texture.bindFramebuffer()
		}
	}
	else {
		if (lastSwitch === 2)
			lastSwitch = 0
	}
	if (lastSwitch < 2)
		drawLightShader();
		//drawBaseShader();
	if (lastSwitch === 1) {
		lastSwitch = 2;
		menu.backgroundContainer.texture.unbindFramebuffer()
		
		menu.blurredBackgroundContainer.texture.bindFramebuffer()
		shaders["blurShader"].bind();
		gl.uniformMatrix4fv(shaders["blurShader"].getUniform('VP'), false, mat4.create());
		gl.uniform1fv(shaders["blurShader"].getUniform('gaussian'), [0.000533, 0.000799, 0.001124, 0.001487, 0.001849, 0.00216, 0.002371, 0.002445, 0.002371, 0.00216, 0.001849, 0.001487, 0.001124, 0.000799, 0.000533, 0.000799, 0.001196, 0.001684, 0.002228, 0.002769, 0.003235, 0.003551, 0.003663, 0.003551, 0.003235, 0.002769, 0.002228, 0.001684, 0.001196, 0.000799, 0.001124, 0.001684, 0.002371, 0.003136, 0.003898, 0.004554, 0.004999, 0.005157, 0.004999, 0.004554, 0.003898, 0.003136, 0.002371, 0.001684, 0.001124, 0.001487, 0.002228, 0.003136, 0.004148, 0.005157, 0.006024, 0.006613, 0.006822, 0.006613, 0.006024, 0.005157, 0.004148, 0.003136, 0.002228, 0.001487, 0.001849, 0.002769, 0.003898, 0.005157, 0.006411, 0.007489, 0.008221, 0.00848, 0.008221, 0.007489, 0.006411, 0.005157, 0.003898, 0.002769, 0.001849, 0.00216, 0.003235, 0.004554, 0.006024, 0.007489, 0.008748, 0.009603, 0.009906, 0.009603, 0.008748, 0.007489, 0.006024, 0.004554, 0.003235, 0.00216, 0.002371, 0.003551, 0.004999, 0.006613, 0.008221, 0.009603, 0.010542, 0.010875, 0.010542, 0.009603, 0.008221, 0.006613, 0.004999, 0.003551, 0.002371, 0.002445, 0.003663, 0.005157, 0.006822, 0.00848, 0.009906, 0.010875, 0.011218, 0.010875, 0.009906, 0.00848, 0.006822, 0.005157, 0.003663, 0.002445, 0.002371, 0.003551, 0.004999, 0.006613, 0.008221, 0.009603, 0.010542, 0.010875, 0.010542, 0.009603, 0.008221, 0.006613, 0.004999, 0.003551, 0.002371, 0.00216, 0.003235, 0.004554, 0.006024, 0.007489, 0.008748, 0.009603, 0.009906, 0.009603, 0.008748, 0.007489, 0.006024, 0.004554, 0.003235, 0.00216, 0.001849, 0.002769, 0.003898, 0.005157, 0.006411, 0.007489, 0.008221, 0.00848, 0.008221, 0.007489, 0.006411, 0.005157, 0.003898, 0.002769, 0.001849, 0.001487, 0.002228, 0.003136, 0.004148, 0.005157, 0.006024, 0.006613, 0.006822, 0.006613, 0.006024, 0.005157, 0.004148, 0.003136, 0.002228, 0.001487, 0.001124, 0.001684, 0.002371, 0.003136, 0.003898, 0.004554, 0.004999, 0.005157, 0.004999, 0.004554, 0.003898, 0.003136, 0.002371, 0.001684, 0.001124, 0.000799, 0.001196, 0.001684, 0.002228, 0.002769, 0.003235, 0.003551, 0.003663, 0.003551, 0.003235, 0.002769, 0.002228, 0.001684, 0.001196, 0.000799, 0.000533, 0.000799, 0.001124, 0.001487, 0.001849, 0.00216, 0.002371, 0.002445, 0.002371, 0.00216, 0.001849, 0.001487, 0.001124, 0.000799, 0.000533]);
		
		menu.backgroundContainer.draw(shaders["blurShader"]);
		menu.blurredBackgroundContainer.texture.unbindFramebuffer()
	}
	if (lastSwitch > 0)
		drawGUI();

	gl.flush();
}

function drawGUI() {
	shaders["defaultShader"].bind();
	gl.uniformMatrix4fv(shaders["defaultShader"].getUniform('VP'), false, mat4.create());
	menu.blurredBackgroundContainer.draw(shaders["defaultShader"]);
	gl.uniformMatrix4fv(shaders["defaultShader"].getUniform('VP'), false, projection.get());
	
    if (menu.sprite !== null) {
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
	{
		sprite.draw(shaders["defaultShader"]);
	}

    player.draw(shaders["defaultShader"]);
}

function drawLightShader() {
	shaders["lightShader"].bind();
	
	gl.uniform1f(shaders["lightShader"].getUniform('lightCount'), level.lightCnt)
	gl.uniform1fv(shaders["lightShader"].getUniform('lights'), level.lights)
	gl.uniformMatrix4fv(shaders["lightShader"].getUniform('VP'), false, pvMatrix);

	for (let sprite of level.objects)
	{
		sprite.draw(shaders["lightShader"]);
	}

    player.draw(shaders["lightShader"]);
}
