/** @typedef { typeof import("replicad") } replicadLib */
import { drawSVG } from "https://cdn.jsdelivr.net/npm/replicad-decorate/dist/studio/replicad-decorate.js";

const CFF_LOGO = `
<svg>
<path xmlns="http://www.w3.org/2000/svg" d="M35.186 17.02h3.75l-5.047-5.163h6.265v5.163h2.96v-5.163h6.267l-5.05 5.163h3.752l6.427-6.708-6.426-6.73h-3.752l5.05 5.185h-6.266V3.583h-2.96v5.184h-6.267l5.047-5.184h-3.75l-6.43 6.73 6.43 6.707" fill="#FFF"/>
</svg>
`;

export const defaultParams = {
  cookieWidth: 75,
  baseHeight: 1.6,
  totalHeight: 15,
  cutterWidth: 0.6,
};

export const defaultName = "CFF Cookie cutter";

export default function main({
  cookieWidth,
  baseHeight,
  cutterWidth,
  totalHeight,
}) {
  let logo = drawSVG(CFF_LOGO);
  const bbox = logo.boundingBox;
  logo = logo
    .translate(-bbox.center[0], -bbox.center[1])
    .scale(cookieWidth / bbox.width);

  const base = logo
    .offset(1)
    .cut(logo.offset(-2.5))
    .sketchOnPlane()
    .extrude(baseHeight);
  const cutter = logo
    .offset(cutterWidth)
    .cut(logo)
    .sketchOnPlane()
    .extrude(totalHeight);

  return base.fuse(cutter);
}
