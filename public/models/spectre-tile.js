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
  depth: 10,
  gutterDepth: 2,
  gutterWidth: 2,
};

const fuseAll = tiles => {
  let result = tiles[0];
  for (let i = 1; i < tiles.length; i++) {
    result = result.fuse(tiles[i]);
  }
  return result;
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

  const unit = width / (3 / 2 + Math.sqrt(3));
  const p = (std, med) => (std + med * MED_SEG) * unit;

  return tile.translate([p(-1.5, 1), p(-1.5, 1)]);
};

const MED_SEG = Math.sqrt(3) / 2;

export default function main({ width, gutterWidth, gutterDepth, depth }) {
  const unit = width / (3 / 2 + Math.sqrt(3));
  const p = (std, med) => (std + med * MED_SEG) * unit;

  const tile = polygonTile({ width }, 0.25);

  const tiles = [
    tile,
    tile.rotate(30, [0, 0]).translate([p(-1.5, 1), p(-1.5, -1)]),
    tile.rotate(-90, [0, 0]).translate([p(1.5, 1), p(-1.5, 1)]),
    tile.rotate(150, [0, 0]).translate([p(-1.5, -1), p(1.5, -1)]),
    tile.rotate(90, [0, 0]).translate([p(-1.5, 1), p(1.5, 1)]),
    tile.rotate(-30, [0, 0]).translate([p(0, 2), p(0, 2)]),
    tile.rotate(-30, [0, 0]).translate([p(1.5, 3), p(-1.5, 3)]),
    tile.rotate(30, [0, 0]).translate([p(-1.5, 3), p(1.5, 3)]),
    tile.rotate(90, [0, 0]).translate([p(-3, 2), p(3, 2)]),
  ];

  const outerBorder = fuseAll(tiles.map(t => t.offset(0.02)));
  const innerTiles = fuseAll(tiles.map(t => t.offset(-gutterWidth / 2)));

  return outerBorder
    .sketchOnPlane()
    .extrude(depth)
    .cut(
      innerTiles.sketchOnPlane("XY", depth - gutterDepth).extrude(gutterDepth)
    );
}
