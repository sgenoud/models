/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { draw } = replicad;

export const defaultParams = {
  width: 30,
  depth: 10,
  gutterDepth: 2,
  gutterWidth: 2,
};

const MED_SEG = Math.sqrt(3) / 2;

const SPECTER_FIRST_POINT_POS = [-1.5 + MED_SEG, -1.5 + MED_SEG];

const SPECTER_SHAPE = [
  [0, 1],
  [-MED_SEG, 0.5],
  [0.5, MED_SEG],
  [1, 0],
  [0, 1],
  [MED_SEG, 0.5],
  [0.5, -MED_SEG], // this is the top,
  [-0.5, -MED_SEG],
  [MED_SEG, -0.5],
  [0, -1],
  [0, -1],
  [-MED_SEG, -0.5],
  [-0.5, MED_SEG],
  [-1, 0],
];

const specterTile = () => {
  const tilePen = draw(SPECTER_FIRST_POINT_POS);

  SPECTER_SHAPE.forEach(([x, y], i) => {
    //tilePen.bulgeArc(x, y, 0.2 * (i % 2 === 0 ? 1 : -1));
    tilePen.line(x, y);
  });

  return tilePen.close();
};

const fuseAll = tiles => {
  let result = tiles[0];
  for (let i = 1; i < tiles.length; i++) {
    result = result.fuse(tiles[i]);
  }
  return result;
};

export default function main({ width, gutterWidth, gutterDepth, depth }) {
  const p = (std, med) => std + med * MED_SEG;

  const tile = specterTile();

  const scaleFactor = width / tile.boundingBox.width;

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

  const innerTiles = fuseAll(
    tiles.map(t => t.offset(-gutterWidth / 2 / scaleFactor))
  ).scale(scaleFactor, [0, 0]);

  const outerBorder = fuseAll(tiles.map(t => t.offset(1e-5))).scale(
    scaleFactor,
    [0, 0]
  );

  return outerBorder
    .sketchOnPlane()
    .extrude(depth)
    .cut(
      innerTiles.sketchOnPlane("XY", depth - gutterDepth).extrude(gutterDepth)
    );
}
