

export Texture = function(path, iterations, resolution) {
	self.name = path
	self.it = iterations
	if (self.it > 0)
	{
		self.texArr = []
		for (i = 0; i < self.it; i++)
		{
			self.texArr[i] = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, self.texArr[i]);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

			const image = new Image();
			if (!resolution) {
				resolution = [512, 512];
			}
			image.width = resolution[0];
			image.height = resolution[1];
			image.onload = function () {
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
				gl.bindTexture(gl.TEXTURE_2D, self.texArr[i]);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			};
			if (self.it > 1)
				image.src = path.splice(path.lastIndexOf("."), 0, String(i));
			else
				image.src = path;
		}
	}
}
Texture.reallyDraw = true


Texture.prototype.draw = function(transform, lighting, isGUI) {
    if (!Texture.reallyDraw) {
        drawOrder.push({
            id,
            transform: mat4.clone(transform),
            lighting,
            y: mat4.getTranslation(vec3.create(), transform)[1]
        });
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareTexCoordBuffer);
    gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, id);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);

    if (shadowShaderActive) {
        gl.uniform1i(textureUniformShadow, 0);
        gl.uniformMatrix4fv(modelUniformShadow, false, transform)
        gl.uniformMatrix4fv(matrixUniformShadow, false, pvMatrix);
    } else {
        gl.uniform1i(textureUniform, 0);
        gl.uniform1i(shadowTextureUniform, 1);
        gl.uniformMatrix4fv(modelUniform, false, transform)
        let mvp = mat4.create();
        mat4.mul(mvp, isGUI ? projectionMatrix : pvMatrix, transform);
        gl.uniformMatrix4fv(matrixUniform, false, mvp);
        gl.uniform1i(specialUniform, lighting == 3 ? 1 : (lighting == 4 ? 2 : 0));
        gl.uniform2f(canvasSizeUniform, canvas.width, canvas.height);
        let intensity = fire.fuel * 2 + flicker * 0.2;
        intensity = intensity * intensity;
        if (lighting == 1) {
            intensity = 4;
        } else if (lighting == 2) {
            intensity = -1;
        }
        gl.uniform1f(fireIntesityUniform, intensity);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
