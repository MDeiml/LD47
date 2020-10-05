import {level, player, menu, inventory} from "./state.js"
import {getItemSprite, pickUp, ITEM_SOUNDS} from "./item.js"
import {walkingLeft, walkingRight, jumping, pickingUp, holdingJump} from "./input.js"
import {vec2, mat4, vec3} from "./gl-matrix-min.js"
import {GameObject, Sprite, Orientation} from "./obj/Sprite.js"
import {loadLevel} from "./level.js"
import {PositionalAudio, walk_wood} from "./audio.js"

const PLAYER_SPEED = 2.5;
const JUMP_SPEED = 13; // 6.75
const GRAVITATION = 38; // 10

export function testIntersection(a, b) {
    let aMin = vec2.sub(vec2.create(), a.position, a.halfSize);
    let aMax = vec2.add(vec2.create(), a.position, a.halfSize);
    let bMin = vec2.sub(vec2.create(), b.position, b.halfSize);
    let bMax = vec2.add(vec2.create(), b.position, b.halfSize);

    if (b.orientation == Orientation.ROTATED_45) {
        // vec2.rotate(aMin, aMin, a.position, Math.PI/4);
        // vec2.rotate(aMax, aMax, a.position, Math.PI/4);
        vec2.sub(aMin, a.position, vec2.fromValues(0, a.halfSize[1]));
        vec2.add(aMax, a.position, vec2.fromValues(0, a.halfSize[1]));
        vec2.rotate(bMin, bMin, b.position, Math.PI/4);
        vec2.rotate(bMax, bMax, b.position, Math.PI/4);

        vec2.rotate(aMin, aMin, vec2.create(), -Math.PI/4);
        vec2.rotate(aMax, aMax, vec2.create(), -Math.PI/4);
        vec2.rotate(bMin, bMin, vec2.create(), -Math.PI/4);
        vec2.rotate(bMax, bMax, vec2.create(), -Math.PI/4);
    }

    let dir1 = vec2.sub(vec2.create(), aMax, bMin);
    let dir2 = vec2.sub(vec2.create(), bMax, aMin);

    let distMin = vec2.min(vec2.create(), dir1, dir2);

    let weirdSize = (b.halfSize[0] + b.halfSize[1]) * Math.sqrt(2) / 2;
    let distX1 = a.position[0] + a.halfSize[0] - (b.position[0] - weirdSize);
    let distX2 = b.position[0] + weirdSize - (a.position[0] - a.halfSize[0]);
    let distX = Math.min(distX1, distX2);

    if (distMin[0] <= 0 || distMin[1] <= 0 || (b.orientation == Orientation.ROTATED_45 && distX <= 0)) return null;

    let res = null;

    if (b.orientation == Orientation.ROTATED_45 && distX < distMin[0] && distX < distMin[1]) {
        return vec2.fromValues(distX1 < distX2 ? distX1 : -distX2, 0);
    }

    if (distMin[0] < distMin[1]) {
        res = vec2.fromValues(dir1[0] < dir2[0] ? dir1[0] : -dir2[0], 0);
    } else {
        res = vec2.fromValues(0, dir1[1] < dir2[1] ? dir1[1] : -dir2[1]);
    }

    if (b.orientation == Orientation.ROTATED_45) {
        vec2.rotate(res, res, vec2.create(), Math.PI/4);
    }

    return res;
}

export function update(delta) {
    let velx = 0;
    if (walkingLeft()) {
		velx -= PLAYER_SPEED;
    }
    if (walkingRight()) {
        velx += PLAYER_SPEED;
    }
    if (level.upsideDown) {
        velx = -velx;
    }
    if (velx > 0) {
		player.orientation = Orientation.DEFAULT;
    } else if (velx < 0) {
		player.orientation = Orientation.MIRRORED;
    }
    if (player.onGround && jumping()) {
        player.velocity[1] = JUMP_SPEED;
    }
    if (!holdingJump()) {
        player.velocity[1] = Math.min(0, player.velocity[1]);
    }

    if (player.velocity[1] >= 0) player.maxY = player.position[1] - player.halfSize[1];
    player.velocity[0] = velx;
    player.velocity[1] -= GRAVITATION * delta;


    let positionDelta = vec2.scale(vec2.create(), player.velocity, delta);
    player.setPosition(vec2.add(player.position, player.position, positionDelta));
    player.onGround = false;
	player.canInteract = false

	let stageTeleportation = false

    for (let obj of level.objects) {
        if (!(obj instanceof GameObject)) continue;
        let intersection = testIntersection(player, obj);
        if (intersection) {
            if (obj.type === "collidable") {
                player.position[1] -= intersection[1];
                if (intersection[1] == 0 || obj.orientation != Orientation.ROTATED_45) {
                    player.position[0] -= intersection[0];
                }
                if (intersection[0] != 0) {
                    player.velocity[0] = 0;
                }
                if (intersection[1] != 0){
                    player.velocity[1] = 0;
                    if (intersection[1] < 0) player.onGround = true;
                }
			} else if (obj.type === "xcollidable") {
                if (intersection[0] == 0 && intersection[1] < 0 && player.velocity[1] < 0 && player.maxY >= obj.position[1] + obj.halfSize[1] - 0.0001) {
					player.setPosition(vec2.sub(player.position, player.position, intersection));
                    player.velocity[1] = 0;
                    player.onGround = true;
                }
            } else if (obj.type === "interactable") {
				player.canInteract = true
				if (pickingUp()) {
                    menu.setSprite(getItemSprite(obj.pickup, mat4.fromScaling(mat4.create(), vec3.fromValues(5, 5, 5)), null, true));
                    menu.cooldown = -1;
					pickUp(obj);
				}
			} else if (obj.type === "teleporter") {
				player.canInteract = true
				if (pickingUp()) {
					stageTeleportation = vec2.fromValues(obj.to["x"], obj.to["y"])
				}
            } else if (obj.type === "fire") {
					stageTeleportation = vec2.fromValues(obj.to["x"], obj.to["y"])
            } else if (obj.type == "door") {
                if (!obj.state) {
                    obj.timer = 0.3;
                    obj.state = "opening";
                } else if (obj.state == "open") {
                    obj.timer = 1;
                } else if (obj.state == "closing") {
                    obj.timer = 0.3 - obj.timer;
                    obj.state = "opening";
                }
            }
        }
        if (obj.type == "door" && obj.timer > 0) {
            obj.timer -= delta;
            if (obj.timer <= 0) {
                if (obj.state == "opening") {
                    obj.state = "open";
                    obj.timer = 1;
                } else if (obj.state == "open") {
                    obj.state = "closing";
                    obj.timer = 0.3;
                } else if (obj.state == "closing") {
                    obj.state = null;
                }
            }
        }
    }

	if (stageTeleportation !== false) {
		player.velocity[0] = 0;
		player.velocity[1] = 0;
		//player.onGround = false;
		player.setPosition(stageTeleportation)
	}

    let walking = player.onGround && player.velocity[0] != 0;

	//TODO add walk circle here
    if (walking && walk_wood.paused) {
        walk_wood.play();
    }
    if (!walking && !walk_wood.paused) {
        walk_wood.pause();
    }

    let exitDir = vec2.sub(vec2.create(), level.exit, player.position);
    if (Math.abs(exitDir[0]) < player.halfSize[0] && Math.abs(exitDir[1]) < player.halfSize[1]) {
        if (inventory.objects.length >= level.id) {
            inventory.opened = true;
            inventory.level_end = true;
        } else {
            // TODO: Tell player they have to collect at least 1 item
            player.position[0] -= 3;
        }
    }
}
