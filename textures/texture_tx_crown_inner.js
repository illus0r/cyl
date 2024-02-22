import {pick, rnd} from "./util.js";

export const texture_tx_crown_inner = `

vec4 texture_tx_crown_inner(vec2 uv) {
    return vec4(palette(${rnd(5)}),1);
}

`