import {level, player} from "./state.js"
import {walkingLeft, walkingRight, jumping, pickingUp} from "./input.js"
import {vec2} from "./gl-matrix-min.js"
import {GameObject} from "./obj/Sprite.js"

const PLAYER_SPEED = 25/10;
const JUMP_SPEED = 10;

export function testIntersection(a, b) {
    let aMin = vec2.sub(vec2.create(), a.position, a.halfSize);
    let aMax = vec2.add(vec2.create(), a.position, a.halfSize);
    let bMin = vec2.sub(vec2.create(), b.position, b.halfSize);
    let bMax = vec2.add(vec2.create(), b.position, b.halfSize);

    let dir1 = vec2.sub(vec2.create(), aMax, bMin);
    let dir2 = vec2.sub(vec2.create(), bMax, aMin);

    let distMin = vec2.min(vec2.create(), dir1, dir2);

    if (distMin[0] <= 0 || distMin[1] <= 0) return null;

    if (distMin[0] < distMin[1]) {
        return vec2.fromValues(dir1[0] < dir2[0] ? dir1[0] : -dir2[0], 0);
    } else {
        return vec2.fromValues(0, dir1[1] < dir2[1] ? dir1[1] : -dir2[1]);
    }
}

export function update(delta) {
    let velx = 0;
    if (walkingLeft()) {
        velx -= PLAYER_SPEED;
    }
    if (walkingRight()) {
        velx += PLAYER_SPEED;
    }
    if (player.onGround && jumping()) {
        player.velocity[1] = JUMP_SPEED;
    }

    player.velocity[0] = velx;
    player.velocity[1] -= 10 * delta;
    let positionDelta = vec2.scale(vec2.create(), player.velocity, delta);
    player.setPosition(vec2.add(player.position, player.position, positionDelta));
    player.onGround = false;

    for (let obj of level.objects) {
        if (!(obj instanceof GameObject)) continue;
        let intersection = testIntersection(player, obj);
        if (intersection) {
            if (obj.type == "collidable") {
                player.setPosition(vec2.sub(player.position, player.position, intersection));
                if (intersection[0] != 0) {
                    player.velocity[0] = 0;
                } else {
                    player.velocity[1] = 0;
                    if (intersection[1] < 0) player.onGround = true;
                }
            } else if (obj.type == "interactable") {
				// TODO: Interaction
				if (pickingUp()) {
					
				}
            }
        }
    }
}
