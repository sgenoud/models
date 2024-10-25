/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { draw, drawRoundedRectangle, drawCircle } = replicad;

export const defaultParams = {
  width: 30,
  depth: 10,
  gutterDepth: 2,
  gutterWidth: 2,
  withTestLock: false,

  bulge: 0.2,
  straightEdges: true,
  //doubleBulge: false,
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
  const keyHole = drawRoundedRectangle(slitWidth, slitDepth)
    .sketchOnPlane()
    .extrude(3);
  const indentation = drawRoundedRectangle(slitDepth, slitWidth)
    .sketchOnPlane("XY", bottomWallThickness - indentationDepth)
    .extrude(indentationDepth);
  return keyHole.fuse(lock.sketchOnPlane("YZ").revolve().fuse(indentation));
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

  return head
    .fuse(body)
    .cut(body.offset(-3))
    .sketchOnPlane()
    .extrude(1.8)
    .chamfer(0.5);
}

export default function main({
  width,
  gutterWidth,
  gutterDepth,
  depth,
  straightEdges,
  // This should be removed and let as an option. As of now, this does does not
  // work as expected (i.e. the order of the bulges is not correct, it should
  // be merged at the drawing level)
  doubleBulge = true,
  bulge,
  withTestLock,
}) {
  const p = (std, med) => std + med * MED_SEG;

  const makeMetaTile = tile => [
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

  const tile = basicSpecterTile();
  const scaleFactor = width / tile.boundingBox.width;

  const innerTile = straightEdges
    ? tile
    : doubleBulge
      ? doubleBulgeSpecterTile(bulge)
      : singleBulgeSpecterTile(bulge);

  const innerTiles = fuseAll(
    makeMetaTile(innerTile).map(t => {
      const bottom = t
        .offset(-gutterWidth / 2 / scaleFactor)
        .scale(scaleFactor, [0, 0]);
      const top = t.offset(-0.15 / scaleFactor).scale(scaleFactor, [0, 0]);

      return bottom
        .sketchOnPlane("XY", depth - gutterDepth)
        .loftWith(top.sketchOnPlane("XY", depth));
    })
  );

  let outerBorder = fuseAll(makeMetaTile(tile).map(t => t.offset(1e-5)))
    .scale(scaleFactor, [0, 0])
    .offset(-0.1);

  if (!straightEdges) {
    const outerBorderPoints = outerBorder.blueprint.curves.map(
      c => c.firstPoint
    );

    let lastPoint = outerBorderPoints.at(-1);

    const d = draw(lastPoint);
    outerBorderPoints.forEach((p, i) => {
      if (doubleBulge) {
        const half = [(lastPoint[0] + p[0]) / 2, (lastPoint[1] + p[1]) / 2];
        d.bulgeArcTo(half, bulge);
        d.bulgeArcTo(p, -bulge);
        lastPoint = p;
      } else {
        d.bulgeArcTo(p, bulge * (i % 2 === 0 ? -1 : 1));
      }
    });

    outerBorder = d.close();
  }

  const returnValue = [
    {
      shape: outerBorder
        .sketchOnPlane()
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
