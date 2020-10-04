import {Texture2D} from "./obj/Sprite.js"

// ls -1 assets/* | xargs printf "%s",\n
let preload_textures = [
"assets/Frame1.png",
"assets/Frame2.png",
"assets/Frame3.png",
"assets/Frame4.png",
"assets/Glowing_inventory_sticker.png",
"assets/Glowing_sticky_Bitch.png",
"assets/Inventar_Board.png",
"assets/Inventory_sticker.png",
"assets/Pause_Tonspur_Level2.png",
"assets/Schrank.png",
"assets/Stand_Character.png",
"assets/Start_Tonspur_level2.png",
"assets/bed0.png",
"assets/dull_sticky_bitch.png",
"assets/find_yourself.png",
"assets/proto_background.png",
"assets/red.png",
"assets/ring_poliert.png",
"assets/single_chair.png",
"assets/three_chairs.png",
"assets/walk_circle.png",
"assets/lv2/Diary_entry.png",
"assets/lv2/Photos_von_freunden.png",
"assets/lv2/Ring_poliert_Blickdicht.png",
"assets/lv2/mailbox_lv2.png",
"assets/lv2/sticky_note.png",
];

export function init(callback) {
    let loading = preload_textures.length;
    for (let path of preload_textures) {
        new Texture2D(path, null, function() {
            loading--;
            if (loading <= 0) {
                callback();
            }
        });
    }
}
