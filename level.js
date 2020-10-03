import {Sprite, GameObject} from "obj/Sprite.js"
import {level} from "state.js"

const X_SCALE = 0.25
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
	
	levelData = JSON.parse(rawData)
	
	//verify ID
	if (levelData["id"] !== id)
		console.warning("Failed to verify level ID with internal ID. Some level designer must have fallen asleep.")
	
	newLevel = {}
	
	newLevel.objects = []
	
	//pedantic
	objects = levelData["objects"].sort((a, b) => TYPE_ID_MAP[a["type"]] < TYPE_ID_MAP[b["type"]] ? -1 : 1)
	
	for (entry of objects)
	{
		let transformation = mat4.create()
		let pos = vec3.fromValues(entry["pos"]["x"] * X_SCALE, entry["pos"]["x"] * Y_SCALE, 0)
		let scale = vec3.fromValues(entry["size"]["x"] * X_SCALE, entry["size"]["x"] * Y_SCALE, 0)
		mat4.fromRotationTranslationScale(transformation, quat.create(), pos, scale)
		switch(entry)
		{
		case "background":
		case "foreground":
		case "deco":
			newLevel.objects.push(new Sprite(gl, "assets/" + entry["spriteName"] + ".png", transformation))
			break;
		case "collidable":
			newLevel.objects.push(new Sprite(gl, "assets/" + entry["spriteName"] + ".png", pos, size))
			break;
		case "interactable":
			newLevel.objects.push(new Sprite(gl, "assets/" + entry["spriteName"] + ".png", pos, size))
			break;
		}
	}
	
	for (entry of levelData["hiddenRooms"])
	{
		let transformation = mat4.create()
		let pos = vec3.fromValues(entry["pos"]["x"] * X_SCALE, entry["pos"]["x"] * Y_SCALE, 0)
		let scale = vec3.fromValues(entry["size"]["x"] * X_SCALE, entry["size"]["x"] * Y_SCALE, 0)
		mat4.fromRotationTranslationScale(transformation, quat.create(), pos, scale)
		newLevel.objects.push(new Sprite(gl, "assets/" + entry["spriteName"] + ".png", transformation))
	}
	
	level =- newLevel
}