const { draw, drawRoundedRectangle } = replicad;

export const defaultParams = {
  pencilLength: 106,
  pencilDiameter: 13,
  pencilsCount: 5,

  innerHeight: 18,

  bottomThickness: 2,
  wallThickness: 1.6,

  tolerance: 0.3,

  coverAngle: 90,
  printInPlace: true,
};

const linearClone = (shape, count, distance) => {
  let result = shape.clone();
  for (let i = 1; i < count; i++) {
    result = result.fuse(shape.clone().translate(distance * i, 0));
  }
  return result.translate((-distance * (count - 1)) / 2, 0);
};

const bump = (outerRadius, width) => {
  return draw()
    .hLine(outerRadius)
    .line(-width, width)
    .hLineTo(0)
    .close()
    .sketchOnPlane("XY")
    .revolve([0, 1, 0]);
};

function pencilsInnerTray({
  pencilDiameter,
  pencilsCount,
  pencilLength,
  pencilPadding = 0.5,
  bottomThickness = 2,
  sideTolerance = 1,
}) {
  const innerRadius = pencilDiameter / 2 + sideTolerance;
  const diameter = innerRadius * 2;
  const height = pencilDiameter / 2 + bottomThickness;

  const singleGutter = draw([-innerRadius - pencilPadding / 2, height])
    .hLine(pencilPadding / 2)
    .sagittaArc(diameter, 0, -pencilDiameter / 2 + sideTolerance)
    .hLine(pencilPadding / 2)
    .vLineTo(0)
    .hLine(-diameter - pencilPadding)
    .vLine(height)
    .close();

  return {
    innerTray: linearClone(singleGutter, pencilsCount, diameter + pencilPadding)
      .sketchOnPlane("XZ", -pencilLength / 2)
      .extrude(pencilLength),
    trayWidth: pencilsCount * (diameter + pencilPadding),
  };
}

function hingedWalls({
  width,
  height,
  depth,
  wallThickness,
  coverThickness,
  tolerance,
  lidOrientation,
}) {
  const outerWalls = draw([
    -width / 2 - wallThickness,
    -height / 2 - wallThickness,
  ])
    .hLine(width + 2 * wallThickness)
    .customCorner(wallThickness)
    .vLine(height + 2 * wallThickness)
    .customCorner(wallThickness)
    .hLine(-width - 2 * wallThickness)
    .close();

  const cover = outerWalls
    .sketchOnPlane("XY", tolerance)
    .extrude(coverThickness);

  const hingeRadius = wallThickness + 1;
  const sideLength = width + wallThickness;

  const horizontalLidDistance = depth / 2;
  const lidDistance = (depth - horizontalLidDistance) / 2;
  const hingePosZ = depth - lidDistance;
  const hingePosX = lidDistance;

  const coverSide = draw([0, tolerance])
    .hLine(sideLength)
    .vLine(-3 * wallThickness - tolerance)
    .customCorner(0.75 * coverThickness)
    .lineTo([hingePosX + wallThickness, -depth])
    .hLineTo(0)
    .vLineTo(0)
    .close()
    .sketchOnPlane("XZ")
    .extrude(wallThickness);

  const hingeBump = bump(hingeRadius, wallThickness + tolerance)
    .translateZ(-hingePosZ)
    .translateX(hingePosX);

  const bumpThickness = Math.min(wallThickness / 2, 1.1 * tolerance);
  const lockBump = bump(bumpThickness + 2 * tolerance, bumpThickness)
    .translateZ(-2 * wallThickness)
    .translateX(sideLength - coverThickness);

  const sideTranslation = [
    -(sideLength + wallThickness) / 2,
    -height / 2 - wallThickness,
  ];

  const sideFixes = coverSide
    .clone()
    .fuse(hingeBump.clone())
    .fuse(lockBump.clone())
    .translateY(-tolerance)
    .fuse(
      drawRoundedRectangle(sideLength, wallThickness + tolerance)
        .translate(sideLength / 2, -(wallThickness + tolerance) / 2)
        .sketchOnPlane()
        .extrude(coverThickness)
        .translateZ(tolerance)
    )
    .chamfer(wallThickness * 0.5, e =>
      e.inPlane("YZ").inPlane("XZ", wallThickness + tolerance)
    )
    .fillet(wallThickness * 0.99, e =>
      e.inPlane("YZ", sideLength).inPlane("XZ", wallThickness + tolerance)
    )
    .translate(...sideTranslation);

  const backWall = drawRoundedRectangle(
    height + 2 * wallThickness + 2 * tolerance,
    depth / 3
  )
    .translate(0, -depth / 6 + tolerance)
    .sketchOnPlane("YZ", -width / 2 - wallThickness)
    .extrude(wallThickness)
    .chamfer(wallThickness * 0.99, e =>
      e.inPlane("YZ", -width / 2).inPlane("XY", -depth / 3 + tolerance)
    );

  let lid = cover
    .fuse(sideFixes.clone())
    .fuse(sideFixes.mirror("XZ"))
    .fuse(backWall.clone());

  const hingeHole = hingeBump.clone().translate(...sideTranslation, depth);

  const lockHole = lockBump.clone().translate(...sideTranslation, depth);

  const holeWidth = Math.min(height / 2 - 2, 8);
  const smallHeight = depth < holeWidth + 5;

  const fingerHole = draw()
    .hLine(holeWidth)
    .vLine(5)
    .sagittaArc(-2 * holeWidth, 0, (smallHeight ? 0 : -holeWidth / 2) - 1)
    .vLine(-5)
    .close()
    .mirror([0, 0])
    .translate(0, depth + wallThickness)
    .sketchOnPlane("YZ", width / 2 + wallThickness / 2)
    .extrude(wallThickness)
    .chamfer(0.4 * wallThickness);

  const walls = outerWalls
    .cut(outerWalls.offset(-wallThickness))
    .sketchOnPlane()
    .extrude(depth)
    .cut(backWall.translateZ(depth - tolerance))
    .cut(hingeHole)
    .cut(hingeHole.clone().mirror("XZ"))
    .cut(lockHole)
    .cut(lockHole.clone().mirror("XZ"))
    .cut(fingerHole)
    .chamfer(wallThickness, e =>
      e.inPlane("XY", depth).inPlane("YZ", -width / 2)
    );

  if (typeof lidOrientation === "number") {
    const holeCenter = [
      sideTranslation[0] + hingePosX,
      sideTranslation[1],
      depth - hingePosZ,
    ];
    lid = lid.translateZ(depth).rotate(-lidOrientation, holeCenter, [0, 1, 0]);
  } else {
    lid = lid.mirror("XY").translateZ(coverThickness + tolerance);
  }

  return {
    walls,
    lid,
  };
}

export default function main({
  pencilLength,
  pencilDiameter,
  pencilsCount,
  innerHeight,

  bottomThickness,
  wallThickness,

  tolerance = 0.2,
  coverAngle = 90,
  printInPlace,
}) {
  const pencilPadding = pencilDiameter / 5;

  const { innerTray, trayWidth: pencilsWidth } = pencilsInnerTray({
    pencilDiameter,
    pencilsCount,
    pencilLength,
    pencilPadding,
    bottomThickness,
  });

  const { walls, lid } = hingedWalls({
    width: pencilsWidth,
    height: pencilLength,
    depth: innerHeight + bottomThickness + tolerance,
    wallThickness,
    coverThickness: bottomThickness,
    tolerance,
    lidOrientation: printInPlace ? coverAngle : undefined,
  });

  const box = walls.fuse(innerTray);

  if (!printInPlace) {
    return [
      { shape: box.translateX(pencilsWidth / 2 + 5), name: "Box" },
      { shape: lid.translateX(-pencilsWidth / 2 - 5), name: "Lid" },
    ];
  }

  return box.fuse(lid);
}
