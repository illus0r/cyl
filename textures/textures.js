import {texture_tx_brim} from "./texture_tx_brim.js"
import {texture_tx_brim_bottom} from "./texture_tx_brim_bottom.js"
import {texture_tx_crown} from "./texture_tx_crown.js"
import {texture_tx_crown_tip} from "./texture_tx_crown_tip.js"
import {texture_tx_crown_inner} from "./texture_tx_crown_inner.js"
import {palette} from "./palettes.js"

export const textures = `

#define PI 3.1415
#define ss(x) smoothstep(0., 0.0001, x)

${palette}
${texture_tx_brim}
${texture_tx_brim_bottom}
${texture_tx_crown}
${texture_tx_crown_tip}
${texture_tx_crown_inner}

`;