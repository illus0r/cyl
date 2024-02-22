import {many, pick} from "./util.js";

const palettes = [
    [
        '#888888', '#FFFFFF',
        '#dddddd', '#444444', '#000000'],
    [
        "#fffcf2", "#ccc5b9",
        "#eb5e28", "#503d39", "#252422"],
    [
        "#F2F1DF", "#F2BD1D",
        "#D94711", "#591812", "#181212"],
    [
        '#dff3e4', '#bca2cd',
        '#7d73c6', '#684da2', '#171738'],
    [
        "#001427", "#708d81",
        "#f4d58d", "#bf0603", "#8d0801"],
    [
        '#faf1dc', '#ff871f',
        '#b80000', '#860909', '#1c1c2a'],
    [
        "#ccc9a1", "#f0ffce",
        "#a53f2b", "#60290e", "#280004"],
    [
        '#fdf0d5', '#669bbc',
        '#c1121f', '#780000', '#003049'],
    [
        "#fbfffe", "#96031a",
        "#1b1b1e", "#000000", "#248dcb"],
    [
        "#dbdbdb", "#efb12a",
        "#a40000", "#2585b1", "#000000"],
    [
        '#C20F00', '#FFDD22',
        '#ffffff', '#2374C6', '#000000'],
    [
        '#fdf0d5', '#003049',
        '#669bbc', '#780000', '#c1121f'],
    [
        '#e63946', '#f1faee',
        '#a8dadc', '#457b9d', '#1d3557'],
    [
        '#000814', '#001d3d',
        '#003566', '#ffc300', '#ffd60a'],
    [
        '#03045e', '#0077b6',
        '#00b4d8', '#90e0ef', '#caf0f8'],
    [
        '#000000', '#14213d',
        '#fca311', '#e5e5e5', '#ffffff'],
    [
        '#0a1128', '#001f54',
        '#034078', '#1282a2', '#fefcfb'],
    [
        '#fff7f4', '#ffc6c6',
        '#ff2f4e', '#c60a5f', '#820a5f'],
    [
        "#252323", "#70798c",
        "#f5f1ed", "#dad2bc", "#a99985"],
];

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