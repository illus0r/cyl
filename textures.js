const palettes = [
    "461220-8c2f39-b23a48-fcb9b2-fed0bb",
    "003049-d62828-f77f00-fcbf49-eae2b7",
    "000814-001d3d-003566-ffc300-ffd60a",
    "e63946-f1faee-a8dadc-457b9d-1d3557",
].map(p => p.trim().split("-").map(c => "#" + c))

const palette = pick(palettes);

export const textures = `

${paletteShaderPart()}
#define PI 3.1415
#define ss(x) smoothstep(0.,0.0001, x)

vec4 texture_tx_brim(vec2 uv) {
    float s = float(${pick([33,55,77])});
    float d = ss(sin(uv.y*s));
    d += ss(sin(uv.x*s));
    return vec4(palette(1.+d),1);
}

vec4 texture_tx_crown(vec2 uv) {
    float d = ss(sin(uv.y*50.));
    d= mix(3., d, ss(uv.x-${pick([.1,.2,.3])}));
    return vec4(palette(d),1);
}

vec4 texture_tx_crown_tip(vec2 uv) {
    return vec4(palette(ss(length(uv-0.5)-0.4)),1);
}

`

function many(n ,fn) {
    return [...Array(n|0)].map((_,i) => fn(i));
}

function paletteShaderPart() {
    const p = palette, n = p.length;
    const c = (s, i) => (parseInt(s.substr(i, 2), 16) / 255).toFixed(4);
    const v = (x) => `vec3(${c(x, 1)},${c(x, 3)},${c(x, 5)});`
    return `
    vec3 color(float x) {
        x = mod(x, ${n}.);
        ${many(n, i => `
        if (x < ${i + 1}.)
            return ${v(p[i])}`).join("")}
    }
    vec3 palette(float x) {
        return mix(color(x), color(x+1.), fract(x));
    }
`;
}

function pick(arr) {
    return arr[(fxrand()*arr.length)|0];
}