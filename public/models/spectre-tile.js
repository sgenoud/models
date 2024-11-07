/** @typedef { typeof import("replicad") } replicadLib */
/** @typedef { typeof import("pantograph2d") } pantographLib */

import {
  pantograph,
  sketchOnPlane,
  initStudioIntegration,
} from "https://cdn.jsdelivr.net/npm/replicad-pantograph/dist/studio/replicad-pantograph.js";
const { draw, offset, cut, fuse } = pantograph;

initStudioIntegration();

function drawRect(width, height) {
  return draw([Math.min(0, -(width / 2)), -height / 2])
    .hLine(width)
    .vLine(height)
    .hLine(-width)
    .vLine(-height)
    .close();
}

export const defaultParams = {
  width: 30,
  depth: 10,
  gutterDepth: 2,
  gutterWidth: 2,
  withTestLock: false,

  bulge: 0.2,
  straightEdges: true,
  doubleBulge: false,
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

const singleBulgeSpecterTile = (bulge = 0.2) => {
  const tilePen = draw(SPECTER_FIRST_POINT_POS);

  SPECTER_SHAPE.forEach(([x, y], i) => {
    tilePen.bulgeArc(x, y, bulge * (i % 2 === 0 ? 1 : -1));
  });

  return tilePen.close();
};

const doubleBulgeSpecterTile = (bulge = 0.2) => {
  const tilePen = draw(SPECTER_FIRST_POINT_POS);

  SPECTER_SHAPE.forEach(([x, y]) => {
    tilePen.bulgeArc(x / 2, y / 2, bulge);
    tilePen.bulgeArc(x / 2, y / 2, -bulge);
  });

  return tilePen.close();
};

const basicSpecterTile = () => {
  const tilePen = draw(SPECTER_FIRST_POINT_POS);

  SPECTER_SHAPE.forEach(([x, y], i) => {
    tilePen.line(x, y);
  });

  return tilePen.close();
};

const p = (std, med) => std + med * MED_SEG;
const makeMetaTile = (tile, scaleFactor) =>
  [
    tile,
    tile.rotate(30, [0, 0]).translateTo([p(-1.5, 1), p(-1.5, -1)]),
    tile.rotate(-90, [0, 0]).translateTo([p(1.5, 1), p(-1.5, 1)]),
    tile.rotate(150, [0, 0]).translateTo([p(-1.5, -1), p(1.5, -1)]),
    tile.rotate(90, [0, 0]).translateTo([p(-1.5, 1), p(1.5, 1)]),
    tile.rotate(-30, [0, 0]).translateTo([p(0, 2), p(0, 2)]),
    tile.rotate(-30, [0, 0]).translateTo([p(1.5, 3), p(-1.5, 3)]),
    tile.rotate(30, [0, 0]).translateTo([p(-1.5, 3), p(1.5, 3)]),
    tile.rotate(90, [0, 0]).translateTo([p(-3, 2), p(3, 2)]),
  ].map(t => t.scale(scaleFactor, [0, 0]));

const fuseAll = tiles => {
  let result = tiles[0];
  for (let i = 1; i < tiles.length; i++) {
    result = result.fuse(tiles[i]);
  }
  return result;
};

function lockShape() {
  const innerRadius = 2;
  const bottomWallThickness = 2;
  const slitWidth = 13;
  const slitDepth = 2;
  const indentationDepth = 0.4;

  const lock = draw()
    .hLine(-innerRadius)
    .vLine(bottomWallThickness)
    .hLine(-5)
    .vLine(0.6)
    .line(4.4, 4.4)
    .hLineTo(0)
    .close();
  const keyHole = sketchOnPlane(drawRect(slitWidth, slitDepth)).extrude(3);
  const indentation = sketchOnPlane(
    drawRect(slitDepth, slitWidth),
    "XY",
    bottomWallThickness - indentationDepth
  ).extrude(indentationDepth);
  return keyHole.fuse(sketchOnPlane(lock, "YZ").revolve().fuse(indentation));
}

function key() {
  const head = draw()
    .hLine(-1.5)
    .vLine(4)
    .hLine(-5)
    .line(3, 3)
    .hLineTo(0)
    .closeWithMirror();

  const body = draw()
    .hLine(-25)
    .customCorner(5)
    .vLine(-25)
    .customCorner(15)
    .hLineTo(0)
    .closeWithMirror();

  const keySketch = cut(fuse(head, body), offset(body, -3));

  return sketchOnPlane(keySketch).extrude(1.8).chamfer(0.5);
}

export default function main({
  width,
  gutterWidth,
  gutterDepth,
  depth,
  straightEdges,
  doubleBulge,
  bulge,
  withTestLock,
}) {
  const tile = straightEdges
    ? basicSpecterTile()
    : doubleBulge
      ? doubleBulgeSpecterTile(bulge)
      : singleBulgeSpecterTile(bulge);

  const scaleFactor = width / tile.boundingBox.width;

  const tiles = makeMetaTile(tile, scaleFactor);

  const innerTiles = fuseAll(
    tiles.map(t => {
      const bottom = offset(t, -gutterWidth / 2);
      const top = offset(t, -0.15);

      return sketchOnPlane(bottom, "XY", depth - gutterDepth).loftWith(
        sketchOnPlane(top, "XY", depth)
      );
    })
  );

  let outerBorder = offset(fuseAll(tiles), -0.1);

  const returnValue = [
    {
      shape: sketchOnPlane(outerBorder)
        .extrude(depth)
        .cut(innerTiles, { optimization: "commonFace" })
        .cut(lockShape().translate([width / 2, 0, 0]), {
          optimization: "commonFace",
        })
        .cut(lockShape().translate([0, width, 0]), {
          optimization: "commonFace",
        }),
      name: "Spectre Stamp",
    },
    {
      shape: key(),
      name: "Removal Key",
    },
  ];

  if (withTestLock) {
    const testLock = drawCircle(10)
      .sketchOnPlane()
      .extrude(depth - gutterDepth)
      .chamfer(0.5)
      .cut(lockShape());

    returnValue.push({
      shape: testLock,
      name: "Test Lock",
    });
  }

  return returnValue;
}
