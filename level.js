import {Sprite, GameObject, Texture2D} from "./obj/Sprite.js"
import {level, menu} from "./state.js"
import {mat4, vec2, vec3, quat} from "./gl-matrix-min.js"

const X_SCALE = 1//0.25
const Y_SCALE = 1

const TYPE_ID_MAP = {
	background : 0,
	deco : 1,
	collidable : 2,
	xcollidable : 3,
	interactable : 4,
	foreground : 5
}

//move to util
function readJSON(file, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET", file, false);
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

    // intro
    if (levelData["intro"]) {
        menu.sprite = new Sprite("assets/" + levelData["intro"]["spriteName"] + ".png", mat4.fromScaling(mat4.create(), vec3.fromValues(5, 5, 5)));
        menu.cooldown = levelData["intro"]["duration"];
    }

	//pedantic
	let objects = levelData["objects"].sort((a, b) => TYPE_ID_MAP[a["type"]] < TYPE_ID_MAP[b["type"]] ? -1 : 1)
	level["objects"] = []

	for (let entry of levelData["hiddenRooms"])
	{
		let transformation = mat4.create()
		let pos = vec3.fromValues(entry["pos"]["x"] * X_SCALE, entry["pos"]["y"] * Y_SCALE, 0)
		let scale = vec3.fromValues(entry["size"]["width"] * X_SCALE * 0.5, entry["size"]["height"] * Y_SCALE * 0.5, 0)
		mat4.fromRotationTranslationScale(transformation, quat.create(), pos, scale)
		level.objects.push(new Sprite("assets/" + entry["spriteName"] + ".png", transformation))
	}

	for (let entry of objects)
	{
		let transformation = mat4.create()
		let pos1 = vec2.fromValues(entry["pos"]["x"] * X_SCALE, entry["pos"]["y"] * Y_SCALE)
		let size = vec2.fromValues(entry["size"]["width"] * X_SCALE, entry["size"]["height"] * Y_SCALE)
	
		let obj = null;

		switch(entry["type"])
		{
		case "background":
		case "foreground":
		case "deco":
			let pos = vec3.fromValues(entry["pos"]["x"] * X_SCALE, entry["pos"]["y"] * Y_SCALE, 0)
			let scale = vec3.fromValues(entry["size"]["width"] * X_SCALE * 0.5, entry["size"]["height"] * Y_SCALE * 0.5, 0)
			mat4.fromRotationTranslationScale(transformation, quat.create(), pos, scale)
			level.objects.push(new Sprite("assets/" + entry["spriteName"] + ".png", transformation))
			break;
		case "collidable":
			level.objects.push(new GameObject("assets/" + entry["spriteName"] + ".png", pos1, size, "collidable"))
			break;
		case "xcollidable":
			level.objects.push(new GameObject("assets/" + entry["spriteName"] + ".png", pos1, size, "xcollidable"))
			break;
		case "interactable":
            obj = new GameObject("assets/" + entry["spriteName"] + ".png", pos1, size, "interactable");
            obj.pickup = entry["pickup"];
			level.objects.push(obj)
			break;
		}
	}

    level.objects.push(new GameObject(null, vec2.fromValues(0, -5), vec2.fromValues(10000, 5), "collidable"));


	level.isInitialized = false
}
