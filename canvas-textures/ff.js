import {settings} from "../settings.js";

const {PI, min, max, sin, cos, atan2, hypot, sign, pow, abs, sqrt, random} = Math;
const TAU = PI * 2;
const state = {last: null, lastCanvas: null};

export const ffTexture = createCanvas2d(settings.ffTx.textureSize)

fillStyle("#fff")
fillRect(-2, -2, 4, 4)


// strokeStyle("#f00")
// strokeWidth(0.01)



let seed = rnd(33333)
let s = settings.ffTx.lineWidth
const tree = q3()

let centers = many(2, () => [rnds(), rnds()])

const ff = field(100, 1, ffCell)

many(1111, randomPoint)
    .map(flow)
    .map(fatLine)
    .forEach(drawPolygon)

function ffCell(x, y) {
    // let d = hypot(x,y)
    let a = noise(x * settings.ffTx.noiseScale, y * settings.ffTx.noiseScale, seed)
    centers.map(([cx,cy]) => a += Math.atan2(y-cx, x-cy))

    // a += Math.atan2(y-0.2, x+0.2)
    // a += Math.atan2(y+0.2, x-0.2)
    return a
}

function dirTo(a, b) {
    return atan2(b[1] - a[1], b[0] - a[0])
}

function fatLine(pts) {

    function computeTangentDir(a, b, c) {
        try {
            return !a ? dirTo(b, c) : dirTo(a, b)
        } catch (e) {
            // debugger
        }
    }

    function shiftRight(pt, i, arr) {

        let a = computeTangentDir(arr[i - 1], pt, arr[i + 1]) + PI / 2;
        // debugger
        return [pt[0] + cos(a) * s, pt[1] + sin(a) * s]
    }

    const result = []
    result.push(...pts.map(shiftRight))
    result.push(...pts.reverse().map(shiftRight))
    return result
}

function drawPolygon(line) {
    fillStyle(pick(["#00f","#0f0","#f00"]))
    setShape(line);
    // strokeShape()
    fillShape()
}

function randomPoint() {
    let a = rndr();
    let d = rnd(0.35)
    // return [cos(a)*d, sin(a)*d]
    return[rnds(),rnds()]
}

function collide(x,y) {
    let box = tree.query(x, y, s*83);
    let cirlce = box.filter(p => hypot(p.x - x, p.y - y) < s*2);
    // debugger
    return cirlce.length;
}

function flow(pt) {
    let step = 0.005;
    let x = pt[0];
    let y = pt[1];
    let result = [];
    let da = 0;//pick([0,PI/2,-PI/2,PI]);
    let prevAngle;
    for (let i = 0; i< 222; i++) {
        let a = ff(x, y);
        if (!a || !ptXaabb(0,0,0.48,0.48,x,y) ||collide(x,y))
            break;
        if (prevAngle && Math.abs(a - prevAngle) > 0.5) {
            break
        }
        prevAngle = a;
        x += cos(a+da) * step
        y += sin(a+da) * step
        result.push([x, y])
    }

    if (result.length > 100) {
        result.forEach(([x,y]) => tree.insert(x,y,0.01))
        return result;
    }
    return []
}





// lib

function rnd(x = 1, y = 0) {
    return y + (window.fxrand||random)() * x;
}

function rndi(x, y = 0) {
    return y + rnd(x) | 0;
}

function rnds(x = 1) {
    return rnd(x) - x / 2;
}

function rndb(x = .5) {
    return rnd() > x;
}

function rndr() {
    return rnd() * TAU;
}

function pick(arr) {
    return arr[rndi(arr.length)];
}

function many(x, fn) {
    return [...Array(x | 0)].map((_, i) => fn(i));
}

function clamp(x, a, b) {
    return max(min(b, x), a);
}

// tx Piter Pasma
function noise(x, y, z = 7127, t = 3141) {
    let w0 = Math.sin(0.3 * x + 1.4 * t + 2.0 + 2.5 * Math.sin(0.4 * y + -1.3 * t + 1.0));
    let w1 = Math.sin(0.2 * y + 1.5 * t + 2.8 + 2.3 * Math.sin(0.5 * z + -1.2 * t + 0.5));
    let w2 = Math.sin(0.1 * z + 1.3 * t + 1.8 + 2.1 * Math.sin(0.3 * x + -1.5 * t + 1.5));
    return (w0 + w1 + w2) / 3;
}

// field
function field(q, ratio, fn) {
    const kw = ratio < 1 ? 1 : ratio;
    const kh = ratio > 1 ? 1 : 1 / ratio;
    const w = q * kw, h = q * kh;
    const fld = many(h, y => many(w, x => {
        return fn((x - w / 2) / q, (y - h / 2) / q);
    }));
    return (x, y) => {
        const row = fld[(y * q + h / 2) | 0];
        return row && row[(x * q + w / 2) | 0];
    }
}

// point in axis aligned bounding box test
function ptXaabb(cx, cy, hw, hh, x, y) {
    return cx - hw < x && cx + hw > x && cy - hh < y && cy + hh > y;
}

// 2 axis aligned bounding boxes intersection test
function aabbXaabb(x1, y1, w1, h1, x2, y2, w2, h2) {
    return abs(x1 - x2) < w1 + w2 ? abs(y1 - y2) < h1 + h2 : 0;
}

// quadtree
function q3(cx = 0, cy = 0, hw = .5, hh = hw) {
    const w = hw / 2, h = hh / 2, children = [], points = [];
    return {
        insert(x, y, r) {
            if (!ptXaabb(cx, cy, hw, hh, x, y))
                return 0;
            if (points.length < 4) {
                points.push({x, y, r});
                return 1;
            }
            !children[0] && children.push(
                q3(cx - w, cy - h, w, h),
                q3(cx + w, cy - h, w, h),
                q3(cx + w, cy + h, w, h),
                q3(cx - w, cy + h, w, h)
            );
            for (let i = 0; i < 4; i++)
                if (children[i].insert(x, y, r))
                    return 1;
            return 0;

        },
        query(x, y, w, h = w) {
            const result = [];
            if (!aabbXaabb(x, y, w, h, cx, cy, hw, hh))
                return result;
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                if (ptXaabb(x, y, w, h, p.x, p.y))
                    result.push(p);
            }
            if (!children[0])
                return result;
            for (let i = 0; i < 4; i++)
                result.push(...children[i].query(x, y, w, h));
            return result;
        }
    }
}

/////// canvas

function palette(colors) {
    state.palette = colors;
}

// canvas
function createCanvas2d(w,h) {
    createCanvas(w,h)
    const c = state.lastCanvas;
    const ctx = c.getContext("2d");
    let sc = min(c.width, c.height);
    ctx.translate(c.width / 2, c.height / 2)
    ctx.scale(sc, sc)
    state.last = ctx;
    return ctx;
}

function createCanvas(w, h = w ) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h
    state.lastCanvas = c;
    return c;
}

function setShape(path, close = true) {
    if (typeof path !== "string") {
        path = "M " + path.join(" L ") + (close ? " Z" : "");
    }
    // console.log(path)
    state.shape = new Path2D(path);
}

function drawShape(method, x = 0, y = 0, r = 0, s = 0) {
    const ctx = state.last;
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-r)
    ctx.scale(s, s)
    ctx[method](state.shape)
    ctx.restore()
}

function fillShape(x = 0, y = 0, r = 0, s = 1) {
    drawShape("fill", x, y, r, s)
}

function strokeShape(x = 0, y = 0, r = 0, s = 1) {
    drawShape("stroke", x, y, r, s)
}

function strokeWidth(x) {
    return assign("lineWidth", x)
}

function assign(k, v) {
    return state.last[k] = v;
}

function assignStyle(param, style) {
    let p = state.palette;
    if (style === null) {
        style = pick(p);
    }
    if (typeof style === "number") {
        style = p[(style | 0) % p.length]
    }
    return assign(param, style);
}

function fillStyle(style) {
    return assignStyle("fillStyle", style)
}

function strokeStyle(style) {
    return assignStyle("strokeStyle", style)
}

function fillRect(x, y, w, h) {
    const ctx = state.last;
    ctx.fillRect(x, y, w, h)
}

