/* global replicad */
const fuseAll = d => {
  let out = d[0];
  d.slice(1).forEach(s => {
    out = s.fuse(out);
  });
  return out;
};

const defaultParams = {
  wallThickness: 1.2,
  bottomThickness: 1.2,
};

const INFANTRY = [40, 40];
const PERSON = [31, 31];

function makeSideHinge(
  height,
  width,
  { hingeRadius = null, tolerance = 0.4, nCouples = 2 }
) {
  const radius = Math.min(height / 2, hingeRadius || height);

  const nElements = nCouples * 2;
  const nCuts = nElements - 1;

  const supportWidth = (width - tolerance * nCuts) / nElements;

  const hingeSupport = () => {
    const x0 = radius + radius / Math.sqrt(2);
    const y0 = radius / Math.sqrt(2);

    const rest = height / 2 - y0;

    const slopeLength = Math.min(rest, x0);

    let support = replicad
      .draw()
      .movePointerTo([radius, height / 2])
      .hLine(-radius)
      .polarLine(radius, -135)
      .line(slopeLength, -slopeLength);

    if (slopeLength < x0) support = support.hLine(x0 - slopeLength);

    return support
      .close()
      .fuse(
        replicad
          .drawRoundedRectangle(radius, height / 2)
          .translate(radius / 2, height / 4)
      )
      .cut(replicad.drawCircle(radius - tolerance).translate(0, height / 2))
      .sketchOnPlane("YZ", +tolerance / 2)
      .extrude(supportWidth);
  };

  const spacer = () =>
    replicad
      .draw()
      .movePointerTo([-tolerance / 2, radius])
      .vLine(-radius / 3)
      .line(-radius / 3, -radius / 3)
      .vLine(-radius / 3)
      .hLine(tolerance)
      .vLine(radius / 3)
      .line(radius / 3, radius / 3)
      .vLine(radius / 3)
      .close();

  let base = replicad
    .drawRoundedRectangle(width, radius)
    .translate(0, radius / 2);

  base = base.cut(spacer());
  for (let i = 1; i < nCouples; i++) {
    console.log(i);
    base = base
      .cut(spacer().translate(i * (supportWidth + tolerance), 0))
      .cut(spacer().translate(-i * (supportWidth + tolerance), 0));
  }

  const support = hingeSupport();
  const mirrorSupport = support
    .clone()
    .mirror(replicad.makePlane("XZ"))
    .translateX(-supportWidth - tolerance);

  let hinge = base
    .sketchOnPlane("XY")
    .revolve([1, 0, 0])
    .translateZ(height / 2)
    .fuse(support)
    .fuse(mirrorSupport);

  const translationStep = supportWidth + tolerance;
  for (let i = 1; i < nCouples; i++) {
    hinge = hinge
      .fuse(support.clone().translateX((-1) ** i * i * 2 * translationStep))
      .fuse(
        mirrorSupport
          .clone()
          .translateX((-1) ** (i + 1) * i * 2 * translationStep)
      );
  }
  if (height / 2 - radius > radius / 2)
    hinge = hinge.chamfer(radius / 2, e =>
      e.inDirection("X").inPlane("XY").inPlane("XZ")
    );

  return {
    hinge: hinge,
    hingeWidth: radius / 2,
  };
}

function makeFlatHinge(height, width, baseHeight, tolerance = 0.4) {
  const radius = height / 2;

  const spacer = () =>
    replicad
      .draw()
      .movePointerTo([-tolerance / 2, radius])
      .vLine(-radius / 3)
      .line(-radius / 3, -radius / 3)
      .vLine(-radius / 3)
      .hLine(tolerance)
      .vLine(radius / 3)
      .line(radius / 3, radius / 3)
      .vLine(radius / 3)
      .close();

  let base = replicad
    .drawRoundedRectangle(width, radius)
    .translate(0, radius / 2);
  base = base
    .cut(spacer())
    .cut(spacer().translate(width / 4, 0))
    .cut(spacer().translate(-width / 4, 0));

  const flapLength = radius + tolerance;

  const flaps = fuseAll([
    replicad
      .drawRoundedRectangle(width / 4 - tolerance / 2, flapLength)
      .translate(-width / 2 + (width / 4 - tolerance / 2) / 2, flapLength / 2),
    replicad
      .drawRoundedRectangle(width / 4 - tolerance, flapLength)
      .translate(width / 4 / 2, flapLength / 2),
    replicad
      .drawRoundedRectangle(width / 4 - tolerance / 2, flapLength)
      .translate(
        -(-width / 2 + (width / 4 - tolerance / 2) / 2),
        -flapLength / 2
      ),
    replicad
      .drawRoundedRectangle(width / 4 - tolerance, flapLength)
      .translate(-(width / 4) / 2, -flapLength / 2),
  ])
    .sketchOnPlane()
    .extrude(baseHeight);
  const hinge = base.sketchOnPlane("XY").revolve([1, 0, 0]).translateZ(radius);

  return {
    hinge: hinge.fuse(flaps).chamfer(0.12, e =>
      e
        .inDirection("X")
        .inPlane("XY", baseHeight)
        .not(e => e.inPlane("XZ", flapLength))
        .not(e => e.inPlane("ZX", flapLength))
    ),
    hingeWidth: flapLength,
  };
}

const main = async ({
  getOC,
  cast,
  draw,
  drawRoundedRectangle,
  makeCompound,
  EdgeFinder,
}) => {
  const bottomThickness = 1;
  const wallThickness = 1.2;
  const innerHeight = 6;

  const boxWalls = (width, height, wallThickness) => {
    const verticalWall = drawRoundedRectangle(wallThickness, (height * 3) / 4);
    const horizontalWall = drawRoundedRectangle((width * 3) / 4, wallThickness);

    return fuseAll([
      verticalWall.clone().translate((width + wallThickness) / 2, 0),
      horizontalWall.clone().translate(0, (height + wallThickness) / 2),
      verticalWall.clone().translate(-(width + wallThickness) / 2, 0),
      horizontalWall.clone().translate(0, -(height + wallThickness) / 2),
    ]);
  };

  const side = 40 + wallThickness;
  const smallSide = (31 + 40) / 2 + wallThickness;
  let grid = fuseAll([
    /*
    boxWalls(31, 31, wallThickness).translate(-smallSide, -4.5),
    boxWalls(40, 40, wallThickness).translate(-side, -40 - wallThickness),
*/
    boxWalls(40, 40, wallThickness),
    boxWalls(40, 40, wallThickness).translate(0, -side),
    boxWalls(40, 40, wallThickness).translate(side, 0),
    boxWalls(40, 40, wallThickness).translate(side, -side),
    boxWalls(40, 40, wallThickness).translate(2 * side, 0),
    boxWalls(40, 40, wallThickness).translate(2 * side, -side),
  ]);

  const gridBox = grid.boundingBox;
  const baseWidth = gridBox.width + 5;
  const baseHeight = gridBox.height + 10;

  const walls = grid
    .translate(-gridBox.center[0], -gridBox.center[1])
    .sketchOnPlane()
    .extrude(innerHeight)
    .simplify()
    .fillet(1, e =>
      e
        .inPlane("XY", innerHeight)
        .ofLength(l => l < wallThickness + 0.01 && l > wallThickness - 0.01)
    )
    .translateZ(bottomThickness);

  let holes = fuseAll([
    /*
    drawRoundedRectangle(26, 26, 3).translate(-smallSide, -4.5),
    drawRoundedRectangle(35, 35, 3).translate(-side, -40 - wallThickness),
*/
    drawRoundedRectangle(35, 35, 3),
    drawRoundedRectangle(35, 35, 3).translate(0, -side),
    drawRoundedRectangle(35, 35, 3).translate(side, 0),
    drawRoundedRectangle(35, 35, 3).translate(side, -side),
    drawRoundedRectangle(35, 35, 3).translate(2 * side, 0),
    drawRoundedRectangle(35, 35, 3).translate(2 * side, -side),
  ])
    .translate(-gridBox.center[0], -gridBox.center[1])
    .sketchOnPlane()
    .extrude(bottomThickness);

  const { hinge, hingeWidth } = makeSideHinge(
    2 * bottomThickness + innerHeight + 0.2,
    20,
    { hingeRadius: 3, tolerance: 0.3 }
  );

  const clip = drawRoundedRectangle(20, wallThickness, wallThickness / 3)
    .sketchOnPlane()
    .extrude(innerHeight + bottomThickness + 0.2)
    .fillet(wallThickness / 3, e =>
      e.inPlane("XY", innerHeight + bottomThickness + 0.2)
    )
    .translateZ(bottomThickness)
    .translateY(baseHeight + hingeWidth - 2 * wallThickness);

  const clipHole = drawRoundedRectangle(
    20.1,
    wallThickness + 0.1,
    wallThickness / 3
  )
    .sketchOnPlane()
    .extrude(bottomThickness)
    .translateY(-(baseHeight + hingeWidth - 2 * wallThickness));

  const baseSheet = drawRoundedRectangle(baseWidth, baseHeight, 3)
    .sketchOnPlane()
    .extrude(bottomThickness)
    .cut(holes);

  const bottom = baseSheet
    .clone()
    .fuse(walls)
    .translateY(baseHeight / 2 + hingeWidth)
    .fuse(clip.clone().translateX(-baseWidth / 4))
    .fuse(clip.clone().translateX(baseWidth / 4));

  const top = baseSheet
    .clone()
    .translateY(baseHeight / 2 + hingeWidth)
    .mirror("XZ")
    .cut(clipHole.clone().translateX(-baseWidth / 4))
    .cut(clipHole.clone().translateX(baseWidth / 4));

  return top
    .fuse(hinge.clone().translateX(baseWidth / 4))
    .fuse(hinge.clone().translateX(-baseWidth / 4))
    .fuse(bottom);
};
