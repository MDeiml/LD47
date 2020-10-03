import {Sprite, GameObject} from "./obj/Sprite.js"
import {level} from "./state.js"
import {mat4, vec2, vec3, quat} from "../gl-matrix-min.js"

const X_SCALE = 1//0.25
const Y_SCALE = 1

const TYPE_ID_MAP = {
	background : 0,
	deco : 1,
	collidable : 2,
	interactable : 3,
	foreground : 4
}

//move to util
function readJSON(file, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4 && rawFile.status == "200") {
			callback(rawFile.responseText);
		}
		else if (rawFile.status != "200")
		{
			alert("failed to load JSON file " + file)
		}
	}
	rawFile.send(null);
}

export function loadLevel(id, gl) {
	readJSON("levels/level" + id + ".json", initLevel.bind(null, id, gl))
}

export function initLevel(id, gl, rawData) {
	//freeze game state
	
	let levelData = JSON.parse(rawData)
	
	//verify ID
	if (levelData["id"] !== id)
		console.warning("Failed to verify level ID with internal ID. Some level designer must have fallen asleep.")
	
	//pedantic
	let objects = levelData["objects"].sort((a, b) => TYPE_ID_MAP[a["type"]] < TYPE_ID_MAP[b["type"]] ? -1 : 1)
	level["objects"] = []
	
	for (let entry of levelData["hiddenRooms"])
	{
		let transformation = mat4.create()
		let pos = vec3.fromValues(entry["pos"]["x"] * X_SCALE, entry["pos"]["y"] * Y_SCALE, 0)
		let scale = vec3.fromValues(entry["size"]["width"] * X_SCALE * 0.5, entry["size"]["height"] * Y_SCALE * 0.5, 0)
		mat4.fromRotationTranslationScale(transformation, quat.create(), pos, scale)
		level.objects.push(new Sprite(gl, "assets/" + entry["spriteName"] + ".png", transformation))
	}
	
	for (let entry of objects)
	{
		let transformation = mat4.create()
		let pos1 = vec2.fromValues(entry["pos"]["x"] * X_SCALE, entry["pos"]["y"] * Y_SCALE)
		let size = vec2.fromValues(entry["size"]["width"] * X_SCALE, entry["size"]["height"] * Y_SCALE)
		
		console.log(pos1)
		console.log(size)
		
		switch(entry["type"])
		{
		case "background":
		case "foreground":
		case "deco":
			let pos = vec3.fromValues(entry["pos"]["x"] * X_SCALE, entry["pos"]["y"] * Y_SCALE, 0)
			let scale = vec3.fromValues(entry["size"]["width"] * X_SCALE * 0.5, entry["size"]["height"] * Y_SCALE * 0.5, 0)
			mat4.fromRotationTranslationScale(transformation, quat.create(), pos, scale)
			level.objects.push(new Sprite(gl, "assets/" + entry["spriteName"] + ".png", transformation))
			break;
		case "collidable":
			level.objects.push(new GameObject(gl, "assets/" + entry["spriteName"] + ".png", pos1, size))
			break;
		case "interactable":
			level.objects.push(new GameObject(gl, "assets/" + entry["spriteName"] + ".png", pos1, size))
			break;
		}
	}
	
	
	level.isInitialized = false
}