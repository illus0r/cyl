export function many(n, fn) {
    return [...Array(n | 0)]
        .map((_, i) => fn(i));
}

export function pick(arr) {
    return arr[rndi(arr.length)];
}

export function rnd(x = 1, y = 0) {
    return fxrand() * x + y;
}

export function rndi(x) {
    return rnd(x) | 0;
}

export function rndb(x = 0.5) {
    return rnd() > x;
}