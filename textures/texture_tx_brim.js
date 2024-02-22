import {pick} from "./util.js";

export const texture_tx_brim = `

vec4 texture_tx_brim(vec2 uv) {
    float s = float(${pick([33,55,77])});
    float d = ss(sin(uv.y*s));
    d += ss(sin(uv.x*s));
    return vec4(palette(1.+d),1);
}

`