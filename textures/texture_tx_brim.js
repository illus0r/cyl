import {pick, rnd} from "./util.js";

export const texture_tx_brim = `

float tx_brim_checkers(vec2 uv){
    float s = float(${pick([33,55,77])});
    float d = ss(sin(uv.y*s));
    d += ss(sin(uv.x*s));
    return d;
}

float tx_brim_checkers_polar(vec2 uv){
    float s = float(${pick([11,22,33])});
    uv -= 0.5;
    uv = vec2(atan(uv.y,uv.x), length(uv));
    float d = ss(sin(uv.y*s));
    d += ss(sin(uv.x*s));
    return d;
}

vec4 texture_tx_brim(vec2 uv) {
    float d = tx_brim_${pick([
        "checkers_polar",
        "checkers",
    ])}(uv) + ${rnd()};
    return vec4(palette(d),1);
}

`