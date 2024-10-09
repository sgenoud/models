/** @typedef { typeof import("replicad") } replicadLib */

import { drawSVG } from "https://cdn.jsdelivr.net/npm/replicad-decorate/dist/studio/replicad-decorate.js";

const POLYGON_POINTS =
  "40.04,78.63 54.16,70.45 54.15,37.83 40.01,29.67 48.15,15.53 40,1.41 25.87,9.58 25.88,25.89 9.56,25.9 1.41,40.04 15.54,48.19 15.55,64.51 31.86,64.5"
    .split(" ")
    .map(p => p.split(",").map(Number));

/** @type {replicadLib} */
const { draw, drawCircle } = replicad;

export const defaultParams = {
  width: 30,
};

const wavyTile = ({ width }) => {
  const originalTile = drawSVG(TILE_WAVY, { width });
  const bbox = originalTile.boundingBox;

  const [x, y] = bbox.center;
  const tile = originalTile.translate([-x, -y]);

  return tile;
};

const wavyTile2 = ({ width }) => {
  const originalTile = drawSVG(TILE_WAVY_2, { width });
  const bbox = originalTile.boundingBox;

  const [x, y] = bbox.center;
  const tile = originalTile.translate([-x, -y]);

  return tile;
};

const polygonTile = ({ width }, bulge = 0.2) => {
  const points = POLYGON_POINTS.flatMap(([x, y], i) => {
    const prev = POLYGON_POINTS.at(i - 1);

    const length = Math.hypot(x - prev[0], y - prev[1]);
    if (length < 20) {
      return [[x, y]];
    }
    const midPoint = [(x + prev[0]) / 2, (y + prev[1]) / 2];
    return [midPoint, [x, y]];
  });

  let previous = points.at(-1);
  const pen = draw(previous);
  points.forEach(p => {
    const [cx, cy] = p;
    const [px, py] = previous;

    const midPoint = [(cx + px) / 2, (cy + py) / 2];
    //pen.bulgeArcTo(midPoint, bulge);
    //pen.bulgeArcTo(p, -bulge);
    pen.lineTo(p);

    previous = p;
  });

  const [x, y] = points[12];
  const rawTile = pen
    .close()
    .translate([-x, -y])
    .mirror([1, 0], [0, 0], "plane");

  const bbox = rawTile.boundingBox;

  const tile = rawTile.scale(width / bbox.width, [0, 0]);

  return tile;
};

const getPoints = tile => {
  return tile.blueprint.curves.map(c => c.firstPoint);
};

const C = {
  s: Math.sqrt(3) / 2,
  h: 0.5,
  l: 1,
};

const MED_SEG = Math.sqrt(3) / 2;

export default function main({ width }) {
  const unit = width / (3 / 2 + Math.sqrt(3));

  const v = 1.5 - Math.sqrt(3) / 2;

  const tile = polygonTile({ width }, 0.25).translate([-v * unit, -v * unit]);

  const tile2 = tile
    .rotate(-90, [0, 0])
    .translate([-(1.5 + MED_SEG) * unit, -v * unit]);

  return [
    tile.fuse(tile2),
    tile.offset(-1),
    {
      shape: tile2.offset(-1),
      color: "red",
    },
  ];
}

const TILE_WAVY = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 211.13 80.96" style="enable-background:new 0 0 211.13 80.96;" xml:space="preserve">
<path class="st0" d="M108.16,64.91c5.75,2.3,4.32,3.8,4.08,7.06c-0.24,3.26-1.67,4.76,4.08,7.06c2.3-5.75,3.8-4.32,7.06-4.08  c3.26,0.24,4.76,1.67,7.06-4.08l0-0.01c-3.83-4.87-1.84-5.45-0.01-8.16c1.84-2.71,3.82-3.29,0-8.16c-3.83-4.87-1.84-5.45,0-8.16  s3.82-3.29,0-8.16c-6.13,0.88-5.64-1.13-7.07-4.08c-1.43-2.94-0.94-4.95-7.07-4.07l-0.01-0.01c-0.88-6.13,1.13-5.64,4.07-7.07  c2.95-1.43,4.95-0.93,4.08-7.07c-5.75-2.3-4.32-3.8-4.08-7.06c0.24-3.26-4.07-7.07-4.07-7.07c-2.3,5.75-3.8,4.32-7.06,4.08  c-3.26-0.24-4.76-1.67-7.06,4.08l0,0.01c3.83,4.87,1.84,5.45,0,8.16c-1.84,2.71-3.82,3.29,0,8.16c-4.87,3.83-5.45,1.84-8.16,0  c-2.71-1.84-3.29-3.82-8.16,0l-0.01,0c0.88,6.13-1.13,5.64-4.07,7.07c-2.95,1.43-4.95,0.94-4.08,7.07l0,0.01  c6.13-0.88,5.64,1.13,7.07,4.07c1.43,2.95,0.94,4.95,7.07,4.07c3.83,4.87,1.84,5.45,0,8.16c-1.84,2.71-3.82,3.29,0,8.16  c4.87-3.83,5.45-1.84,8.16,0C102.7,66.75,103.28,68.74,108.16,64.91L108.16,64.91z"/>
</svg>
`;

const TILE_WAVY_2 = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 211.13 80.96" style="enable-background:new 0 0 211.13 80.96;" xml:space="preserve">
<path xmlns="http://www.w3.org/2000/svg" class="st1" d="M201.56,16.38c0.58,6.14-1.98,14-8.15,14.2l0.02,0.01c0.2,6.17,8.06,8.73,14.2,8.15l-0.11-0.03  c3.58,5.03,5.29,13.11,0.04,16.37l0.01-0.01c-5.25,3.26-3.54,11.34,0.04,16.37l0-0.11c-2.57,5.61-8.71,11.14-14.16,8.22l-0.01,0  c2.91-5.44-2.61-11.59-8.22-14.16l0.11,0c-5.03,3.58-13.11,5.29-16.37,0.04c5.25-3.26,3.54-11.34-0.04-16.37l0.1,0.06  c-6.14,0.58-14-1.98-14.2-8.15l0-0.01c6.17-0.2,8.73-8.06,8.15-14.2l-0.07,0.1c5.03-3.58,13.11-5.29,16.37-0.04l0.02-0.01  c5.25-3.26,3.54-11.34-0.04-16.37l0,0.13c2.57-5.61,8.71-11.14,14.16-8.22l0.01,0c-2.91,5.44,2.61,11.59,8.22,14.16"/>
</svg>
  `;
