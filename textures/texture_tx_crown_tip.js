import {pick} from "./util.js";

export const texture_tx_crown_tip = `

vec4 texture_tx_crown_tip(vec2 uv) {
    return vec4(palette(ss(length(uv-0.5)-0.4)),1);
}

`