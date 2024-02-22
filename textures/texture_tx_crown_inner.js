import {pick} from "./util.js";

export const texture_tx_crown_inner = `

vec4 texture_tx_crown_inner(vec2 uv) {
    float d = ss(sin(uv.y*50.));
    d= mix(3., d, ss(uv.x-${pick([.1,.2,.3])}));
    return vec4(palette(d),1);
}

`