import {pick, rnd, rndb} from "./util.js";

export const texture_tx_crown = `

float tx_vert(vec2 uv) {
    float d = ss(sin(uv.y*50.));
    return d;
}

float tx_hor(vec2 uv) {
    float d = floor(uv.x*${rnd(3,2)} + sin(uv.y)*5.215*float(${pick([0,1,-1])}));
    return d;
}

float tx_cells(vec2 uv) {
    uv *= vec2(5, 20);
    vec2 id = floor(uv);
    uv = fract(uv) - 0.5;
    float d = ss(length(uv)-${rnd(0.4,0.2)});    
    return d;
}

vec4 texture_tx_crown(vec2 uv) {
    float d = tx_${pick([
        "cells",
        "vert",
        "hor"
    ])}(uv) + ${rnd(5)};
    // ${rndb() ? `d = mix(${rnd(5)}, d, ss(uv.x-0.2));` : ""}
    return vec4(palette(d),1);
}

`