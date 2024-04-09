const { draw, drawRoundedRectangle } = replicad;

export const defaultParams = {
  width: 69,
  height: 34,
  depth: 25,
  wallThickness: 1.6,
  fillet: 3,
  bottomThickness: 2,
  enableLidSidesHeight: true,
};

const sideShape = (startPoint, endPoint, height) => {
  const shape = draw([0, height])
    .hLine(-startPoint)
    .vLine(-1.4)
    .customCorner(0.4)
    .smoothSplineTo([-endPoint, 0], { endTangent: -90, startTangent: 0 })
    .hLine(endPoint)
    .closeWithMirror();

  const minRect = drawRoundedRectangle(2 * endPoint - 0.2, height).translate([
    0,
    height / 2,
  ]);

  return shape.fuse(minRect);
};

const rect = (length, height) => {
  return drawRoundedRectangle(length, height).translate(0, height / 2);
};

function tray({
  width,
  height,
  depth,
  wallThickness,
  fillet,
  tolerance = 0.1,
  sideMargin = 5,
  bottomWidth = 16,
  bottomThickness = 2.4,
  enableLidSidesHeight = true,
}) {
  const bottom = drawRoundedRectangle(
    height + 2 * wallThickness,
    width + 2 * wallThickness
  )
    .sketchOnPlane()
    .extrude(bottomThickness);

  const front = rect(height + 2 * wallThickness, depth)
    .cut(sideShape(height / 2 - sideMargin, bottomWidth / 2, depth))
    .sketchOnPlane("XZ")
    .extrude(-wallThickness)
    .translateY(width / 2);
  const back = front.clone().mirror("XZ");

  const left = rect(width + 2 * wallThickness, depth)
    .cut(sideShape(width / 2 - sideMargin, bottomWidth / 2, depth))
    .sketchOnPlane("YZ")
    .extrude(wallThickness)
    .translateX(height / 2);

  const right = left.clone().mirror("YZ");

  let tray = front
    .fuse(back)
    .fuse(left)
    .fuse(right)
    .translateZ(bottomThickness)
    .fuse(bottom)
    .fillet(fillet, (e) =>
      e
        .inDirection("Z")
        .either([
          (e) => e.inPlane("XZ", width / 2 + wallThickness),
          (e) => e.inPlane("XZ", -width / 2 - wallThickness),
        ])
        .either([
          (e) => e.inPlane("YZ", height / 2 + wallThickness),
          (e) => e.inPlane("YZ", -height / 2 - wallThickness),
        ])
    );

  const innerFillet = fillet - wallThickness;
  if (innerFillet > 0) {
    tray = tray.fillet(innerFillet, (e) =>
      e
        .inDirection("Z")
        .either([
          (e) => e.inPlane("XZ", width / 2),
          (e) => e.inPlane("XZ", -width / 2),
        ])
        .either([
          (e) => e.inPlane("YZ", height / 2),
          (e) => e.inPlane("YZ", -height / 2),
        ])
    );
  }

  const bottomCutout = draw()
    .vLine(bottomThickness)
    .hLine(-wallThickness - tolerance)
    .line(-bottomThickness / 2, -bottomThickness / 2)
    .vLine(-bottomThickness / 2)
    .close()
    .translate(wallThickness, 0)
    .sketchOnPlane("XZ", -bottomWidth / 2)
    .extrude(bottomWidth);

  tray = tray
    .cut(
      bottomCutout
        .clone()
        .rotate(90)
        .translateY(width / 2)
    )
    .cut(
      bottomCutout
        .clone()
        .rotate(-90)
        .translateY(-width / 2)
    );

  if (enableLidSidesHeight) {
    tray = tray.cut(bottomCutout.clone().translateX(height / 2)).cut(
      bottomCutout
        .clone()
        .mirror("YZ")
        .translateX(-height / 2)
    );
  }

  return tray;
}

function lid({
  width,
  height,
  depth,
  wallThickness,
  fillet,
  bottomThickness,
  tolerance = 0.1,
  sideMargin = 5,
  bottomWidth = 16,
  enableLidSidesHeight = true,
}) {
  const front = sideShape(
    height / 2 - sideMargin - tolerance,
    bottomWidth / 2 - 2 * tolerance,
    depth
  )
    .mirror([1, 0], [0, 0], "plane")
    .translate(0, depth)
    .sketchOnPlane("XZ")
    .extrude(-wallThickness)
    .translateY(width / 2);
  const back = front.clone().mirror("XZ");

  const left = sideShape(
    width / 2 - sideMargin - tolerance,
    bottomWidth / 2 - 2 * tolerance,
    depth
  )
    .mirror([1, 0], [0, 0], "plane")
    .translate(0, depth)
    .sketchOnPlane("YZ")
    .extrude(wallThickness)
    .translateX(height / 2);
  const right = left.clone().mirror("YZ");
  const top = drawRoundedRectangle(
    height + 2 * wallThickness,
    width + 2 * wallThickness
  )
    .sketchOnPlane()
    .extrude(wallThickness);

  let lid = front.fuse(back);
  if (enableLidSidesHeight) {
    lid = lid.fuse(left).fuse(right);
  }
  lid = lid
    .translateZ(wallThickness)
    .fuse(top.fillet(fillet, (e) => e.inDirection("Z")))
    .fillet(1, (e) =>
      e.either([
        (e) => e.containsPoint([height / 2, 0, wallThickness]),
        (e) => e.containsPoint([-height / 2, 0, wallThickness]),
        (e) => e.containsPoint([0, width / 2, wallThickness]),
        (e) => e.containsPoint([0, -width / 2, wallThickness]),
      ])
    );

  const bottomBulge = draw()
    .line(-bottomThickness / 3, bottomThickness / 3)
    .vLine(bottomThickness / 3)
    .line(bottomThickness / 3, bottomThickness / 3)
    .hLine(wallThickness)
    .vLine(-bottomThickness)
    .close()
    .sketchOnPlane("XZ", -bottomWidth / 2 + 2 * tolerance)
    .extrude(bottomWidth - 4 * tolerance)
    .translateZ(depth + wallThickness);

  lid = lid
    .fuse(
      bottomBulge
        .clone()
        .rotate(90)
        .translateY(width / 2)
    )
    .fuse(
      bottomBulge
        .clone()
        .rotate(-90)
        .translateY(-width / 2)
    );

  if (enableLidSidesHeight) {
    lid = lid.fuse(bottomBulge.clone().translateX(height / 2)).fuse(
      bottomBulge
        .clone()
        .mirror("YZ")
        .translateX(-height / 2)
    );
  }
  return lid;
}

export default function main(params) {
  return [tray(params), lid(params)];
  return [
    {
      shape: tray(params),
      name: "Tray",
    },
    {
      shape: lid(params)
        .mirror("XY")
        .translateZ(
          params.depth + params.wallThickness + params.bottomThickness
        ),
      name: "Lid",
      color: "grey",
    },
  ];
}
