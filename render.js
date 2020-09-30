import * as Shader from "./obj/Shader.js"
import {mat4} from "./gl-matrix-min.js"

//graphics context objects not exported - compartmentalization
let gl = null
let shaders = {}
let sprites = []

//transformation view
let transform = mat4.create()
let projectionMatrix = mat4.create()
let pvMatrix = mat4.create()
//render state
let isGUI = true
let lighting = 0
//move to global state in some way
let w = 0
let h = 0

//TODO add texture construction

export function init(c) {
    let canvas = c;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w;
    canvas.height = h;
    gl = canvas.getContext('webgl');
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    initShaders();
}

function initShaders(name) {
	
	shaders["defaultShader"] = new Shader.Shader(gl, "shader")
	shaders["shadowShader"] = new Shader.Shader(gl, "shadow")
	
	shaders["defaultShader"].bind()
    let defaultPositionAttribute = gl.getAttribLocation(shaders["defaultShader"].get(), 'position');
    let defaultTexCoordAttribute = gl.getAttribLocation(shaders["defaultShader"].get(), 'texCoord');
	
    gl.enableVertexAttribArray(defaultPositionAttribute);
    gl.enableVertexAttribArray(defaultTexCoordAttribute);
	
}


export function update() {
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	drawShadowShader();
	drawBaseShader();
}

function drawBaseShader() {
	shaders["defaultShader"].bind()
	
	gl.uniformMatrix4fv(shaders["defaultShader"].getUniform('M'), false, transform)
	
	let mvp = mat4.create();
	mat4.mul(mvp, isGUI ? projectionMatrix : pvMatrix, transform);
	gl.uniformMatrix4fv(shaders["defaultShader"].getUniform('MVP'), false, mvp);
	
	gl.uniform1i(shaders["defaultShader"].getUniform('special'), lighting == 3 ? 1 : (lighting == 4 ? 2 : 0));
	gl.uniform2f(shaders["defaultShader"].getUniform('canvasSize'), w, h);
	
	let intensity = 2.2; //change to animated way again
	intensity = intensity * intensity;
	if (lighting == 1) {
		intensity = 4;
	} else if (lighting == 2) {
		intensity = -1;
	}
	gl.uniform1f(shaders["defaultShader"].getUniform('fireIntensity'), intensity);
	
	for (sprite of sprites)
		sprite.draw(shaders["defaultShader"])
}

function drawShadowShader() {
	shaders["shadowShader"].bind()
	
	gl.uniform1i(shaders["shadowShader"].getUniform('texture'), 0);
	gl.uniformMatrix4fv(shaders["shadowShader"].getUniform('M'), false, transform)
	gl.uniformMatrix4fv(shaders["shadowShader"].getUniform('VP'), false, pvMatrix);
	
	for (sprite of sprites)
		sprite.updateShadow(shaders["shadowShader"])
}

