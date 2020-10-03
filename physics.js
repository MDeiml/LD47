import {level, player} from "./state.js"
import {keyDown} from "./input.js"
import {vec2} from "./gl-matrix-min.js"

const PLAYER_SPEED = 1;

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
    let vel = vec2.create();
    if (keyDown("KeyA")) {
        vel[0] -= 1;
    }
    if (keyDown("KeyD")) {
        vel[0] += 1;
    }
    vec2.scale(vel, vel, PLAYER_SPEED * delta);
    player.setPosition(vec2.add(player.position, player.position, vel));

    for (let obj of level.objects) {
        let intersection = testIntersection(player, obj);
        if (intersection) {
            if (obj.type == "collidable") {
                player.setPosition(vec2.sub(player.position, player.position, intersection));
            } else if (obj.type == "interactable") {
                // TODO: Interaction
            }
        }
    }
}
