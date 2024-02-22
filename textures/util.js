export function many(n ,fn) {
    return [...Array(n|0)].map((_,i) => fn(i));
}

export function pick(arr) {
    return arr[(fxrand()*arr.length)|0];
}