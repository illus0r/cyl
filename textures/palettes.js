import {many, pick} from "./util.js";

const palettes = [
    "461220-8c2f39-b23a48-fcb9b2-fed0bb",
    "003049-d62828-f77f00-fcbf49-eae2b7",
    "000814-001d3d-003566-ffc300-ffd60a",
    "e63946-f1faee-a8dadc-457b9d-1d3557",
].map(p => p.trim().split("-").map(c => "#" + c));

const
    p = pick(palettes),
    n = p.length,
    c = (s, i) => (parseInt(s.substr(i, 2), 16) / 255).toFixed(4),
    v = (x) => `vec3(${c(x, 1)},${c(x, 3)},${c(x, 5)});`
;

export const palette = `

    vec3 getColor(float x) {
        x = mod(x, ${n}.);
        ${many(n, i => `
            if (x < ${i + 1}.)
                return ${v(p[i])}
        `).join("")}
    }
    
    vec3 palette(float x) {
        return mix(getColor(x), getColor(x+1.), fract(x));
    }
`;