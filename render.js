import * as Shader from "./obj/Shader.js"


let gl = null
let shaders = {}
//TODO add texture construction

//TODO move to sprite as a static data object. transformation should handle the rest
let squareBuffer = null
let squareTexCoordBuffer = null

//let defaultPositionAttribute = null
//let defaultTexCoordAttribute = null


export function init(c)
{
    let canvas = c;
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    canvas.width = w;
    canvas.height = h;
    gl = canvas.getContext('webgl');
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    initShaders();
    initSquare();
}

function initShaders(name) {
	
	shaders["defaultShader"] = new Shader.Shader(gl, "shader")
	shaders["shadowShader"] = new Shader.Shader(gl, "shadow")
	
	shaders["defaultShader"].bind()
    let defaultPositionAttribute = gl.getAttribLocation(shaders["defaultShader"].get(), 'position');
    let defaultTexCoordAttribute = gl.getAttribLocation(shaders["defaultShader"].get(), 'texCoord');
	
    gl.enableVertexAttribArray(defaultPositionAttribute);
    gl.enableVertexAttribArray(defaultTexCoordAttribute);
	
	//wegen caching ueberfluessig
	shaders["defaultShader"].getUniform('MVP')
	shaders["defaultShader"].getUniform('M')
	shaders["defaultShader"].getUniform('texture')
	shaders["defaultShader"].getUniform('fireIntensity')
	shaders["defaultShader"].getUniform('shadowTexture')
	shaders["defaultShader"].getUniform('canvasSize')
	shaders["defaultShader"].getUniform('special')
	
	
	shaders["shadowShader"].bind()
	shaders["shadowShader"].getUniform('VP')
	shaders["shadowShader"].getUniform('M')
	shaders["shadowShader"].getUniform('texture')
}

function initSquare() {
    squareBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
    const vertices = [ //ein 1 : 2 rechteck. eigentlich doch zeit fuer scale Matrizen
        0.5, 0, 1,
        -0.5, 0, 1,
        0.5, 0, 0,
        -0.5, 0, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    squareTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareTexCoordBuffer);
    const texCoords = [
        1, 0,
        0, 0,
        1, 1,
        0, 1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
}

