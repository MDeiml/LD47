import {Texture2D} from "./obj/Sprite.js"

// ls -1 assets/* | xargs printf "%s",\n
let preload_textures = [
"assets/Door.png",
"assets/Floor_Texture.png",
//"assets/Frame1.png",
//"assets/Frame2.png",
//"assets/Frame3.png",
//"assets/Frame4.png",
"assets/Glowing_inventory_sticker.png",
"assets/Glowing_sticky_Bitch.png",
"assets/Inventar_Board.png",
"assets/Inventory_sticker.png",
"assets/Level_1_Teil1_Background.png",
"assets/Level_1_Teil1_Colli.png",
"assets/Level_1_Teil2_Background.png",
"assets/Level_1_Teil2_Colli.png",
"assets/Level_1_Teil3_Background.png",
"assets/Level_1_Teil3_Colli.png",
//"assets/Pause_Tonspur_Level2.png",
"assets/Schrank.png",
"assets/Stand_Character.png",
//"assets/Start_Tonspur_level2.png",
"assets/bed0.png",
"assets/dull_sticky_bitch.png",
"assets/find_yourself.png",
"assets/grey.png",
"assets/proto_background.png",
"assets/red.png",
"assets/ring_poliert.png",
"assets/single_chair.png",
"assets/three_chairs.png",
//"assets/walk_circle.png",
"assets/walk_circle_halved.png",
"assets/lvl1/Pocket_Watch.png",
"assets/lvl1/drawing_behing_clock.png",
"assets/lvl1/home-sweet-home.png",
"assets/lvl1/kids-drawing.png",
"assets/lvl1/love-letter.png",
"assets/lvl1/love-you.png",
"assets/lvl2/Diary_entry.png",
"assets/lvl2/Photos_von_freunden.png",
"assets/lvl2/Ring_poliert_Blickdicht.png",
"assets/lvl2/mailbox_lv2.png",
"assets/lvl2/sticky_note.png",
"assets/lvl3/Medical_Record.png",
"assets/lvl4/Flask.png",
"assets/lvl4/divorce_papers.png"

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
