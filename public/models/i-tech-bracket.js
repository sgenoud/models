/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { drawRoundedRectangle, draw } = replicad;

export const defaultParams = {
  squareSide: 115,
  depth: 30,
  fillet: 16,
  supportWidth: 18,
  wallThickness: 2,
  screwDiameter: 3.1,
  screwHeadDiameter: 7,
  margin: 3,
  fullFillet: true,
};

function withoutScrewHoles({
  squareSide,
  screwHeadDiameter,
  wallThickness,
  depth,
}) {
  const cornerMin = (xSign, ySign) => [
    xSign * (squareSide / 2) - screwHeadDiameter / 2,
    ySign * (squareSide / 2) - screwHeadDiameter / 2,
    depth + wallThickness,
  ];
  const cornerMax = (xSign, ySign) => [
    xSign * (squareSide / 2) + screwHeadDiameter / 2,
    ySign * (squareSide / 2) + screwHeadDiameter / 2,
    depth + wallThickness - screwHeadDiameter,
  ];

  return (e) =>
    e
      .not((e) => e.inBox(cornerMin(1, 1), cornerMax(1, 1)))
      .not((e) => e.inBox(cornerMin(1, -1), cornerMax(1, -1)))
      .not((e) => e.inBox(cornerMin(-1, 1), cornerMax(-1, 1)))
      .not((e) => e.inBox(cornerMin(-1, -1), cornerMax(-1, -1)));
}

function basicFillet({ wallThickness, squareSide, screwHeadDiameter, depth }) {
  return (e) => {
    return e.either([
      (e) => e.inPlane("XY"),
      (e) => e.inPlane("XY", wallThickness),
      (e) => e.inPlane("XZ", squareSide / 2),
      (e) => e.inPlane("XZ", squareSide / 2 + wallThickness),
      (e) => e.inPlane("XZ", -squareSide / 2),
      (e) => e.inPlane("XZ", -squareSide / 2 - wallThickness),
      (e) => e.inPlane("YZ", squareSide / 2),
      (e) => e.inPlane("YZ", squareSide / 2 + wallThickness),
      (e) => e.inPlane("YZ", -squareSide / 2),
      (e) => e.inPlane("YZ", -squareSide / 2 - wallThickness),
    ]);
  };
}

export default function main({
  squareSide,
  depth,
  fillet,
  wallThickness,
  supportWidth,
  margin,
  screwDiameter,
  screwHeadDiameter,
  fullFillet,
}) {
  const centerHole = drawRoundedRectangle(
    squareSide - supportWidth,
    squareSide - supportWidth,
    fillet - supportWidth / 2,
  )
    .sketchOnPlane("XY")
    .extrude(depth + wallThickness + 1);

  const sideHoleWidth = squareSide / 2 - fillet;
  const sideHoles = draw([0, depth + wallThickness])
    .hLine(sideHoleWidth)
    .line(-margin, -margin)
    .vLine(-depth + 3 * margin)
    .line(-margin, -margin)
    .hLine(-sideHoleWidth + 2 * margin)
    .closeWithMirror()
    .sketchOnPlane("XZ", -squareSide)
    .extrude(2 * squareSide);

  const screwHole = draw()
    .hLine(screwDiameter / 2)
    .line(
      (screwHeadDiameter - screwDiameter) / 2,
      (screwHeadDiameter - screwDiameter) / 2,
    )
    .vLine(depth)
    .hLineTo(0)
    .close()
    .sketchOnPlane("XZ")
    .revolve();

  const boxCorner = drawRoundedRectangle(
    squareSide + 2 * wallThickness,
    squareSide + 2 * wallThickness,
    fillet + wallThickness,
  )
    .translate(-squareSide / 2 - wallThickness, -squareSide / 2 - wallThickness)
    .sketchOnPlane()
    .extrude(depth + wallThickness);

  const minScrewBase = Math.min(2 * screwHeadDiameter, fillet * 1);

  let screwBase = draw([0, -screwHeadDiameter])
    .lineTo([-screwHeadDiameter, -minScrewBase / 2])
    .vLine(minScrewBase)
    .lineTo([0, screwHeadDiameter])
    .bulgeArc(0, -2 * screwHeadDiameter, -1)
    .close();

  screwBase = screwBase
    .sketchOnPlane()
    .loftWith(screwBase.sketchOnPlane("XY", screwDiameter / 2), {
      endPoint: [-screwHeadDiameter, 0, screwHeadDiameter * 2],
    });

  let screwSupport = screwBase
    .rotate(45)
    .translate([-screwHeadDiameter / 5, -screwHeadDiameter / 5])
    .cut(screwHole)
    .cut(boxCorner);

  screwSupport = screwSupport
    .mirror("XY")
    .translate([
      squareSide / 2 + wallThickness,
      squareSide / 2 + wallThickness,
      depth + wallThickness,
    ]);

  const filletFunction = !fullFillet
    ? basicFillet({ wallThickness, squareSide, margin, depth })
    : withoutScrewHoles({
        squareSide,
        screwHeadDiameter,
        wallThickness,
        depth,
      });

  const shape = drawRoundedRectangle(
    squareSide + 2 * wallThickness,
    squareSide + 2 * wallThickness,
    fillet + wallThickness,
  )
    .sketchOnPlane("XY")
    .extrude(depth + wallThickness)
    .shell(wallThickness, (f) => f.inPlane("XY", depth + wallThickness))
    .cut(centerHole)
    .cut(sideHoles.clone().rotate(90, [0, 0, 1]))
    .cut(sideHoles)
    .fuse(screwSupport.clone().rotate(90, [0, 0, 1]))
    .fuse(screwSupport.clone().rotate(180, [0, 0, 1]))
    .fuse(screwSupport.clone().rotate(270, [0, 0, 1]))
    .fuse(screwSupport.clone())
    .chamfer(wallThickness / 3, filletFunction);

  return { shape, name: "i-tech-bracket" };
}
