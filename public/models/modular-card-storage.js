/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { draw } = replicad;

export const defaultParams = {
  width: 20,
  height: 10,
  depth: 5,
  wallThickness: 1.6,
  slitWidth: 2.2,
  filletRadius: 3,
  tolerance: 0.1,
  lidDepth: 7,
};

const makeSlit = (featureSize, bottomThickness, tolerance = 0) => {
  return draw([tolerance, 0])
    .vLine(featureSize * 0.2 + tolerance)
    .customCorner(featureSize * 0.1, "chamfer")
    .sagittaArc(
      featureSize * 0.6 - 2 * tolerance,
      featureSize * 0.3 - tolerance,
      featureSize * 0.8 - 2 * tolerance
    )
    .customCorner(featureSize * 0.2)
    .lineTo([bottomThickness - tolerance, 0])
    .close();
};

export default function main({
  width,
  height,
  depth,
  wallThickness,
  slitWidth,
  filletRadius,
  tolerance,
  lidDepth,
}) {
  const baseProfile = () =>
    draw()
      .hLine(width / 2 + wallThickness + slitWidth / 2)
      .line(wallThickness / 2, slitWidth * 0.8)
      .customCorner(wallThickness)
      .lineTo([width / 2 + wallThickness - tolerance, depth + wallThickness]);

  const trayProfile = baseProfile()
    .hLine(-wallThickness + tolerance)
    .line(0, -depth)
    .customCorner(filletRadius / 2)
    .lineTo([0, wallThickness])
    .closeWithMirror();

  const bottomTrayProfile = baseProfile().hLineTo(0).closeWithMirror();

  const endSlitCutout = draw([0, wallThickness])
    .hLine(1.5 * slitWidth)
    .vLine(1.5 * slitWidth)
    .close()
    .sketchOnPlane("YZ", -slitWidth)
    .extrude(2 * slitWidth)
    .translate([
      width / 2 + 2 * wallThickness - slitWidth / 2,
      depth + wallThickness,
      0,
    ]);

  const slitHoleProfile = makeSlit(
    slitWidth,
    wallThickness + tolerance
  ).translate([-width / 2 - wallThickness, 0]);
  const slitProfile = makeSlit(
    slitWidth,
    wallThickness + tolerance,
    tolerance
  ).translate([-width / 2 - wallThickness, depth + wallThickness]);

  //return [slitHoleProfile, slitProfile];

  const sideProfile = trayProfile
    .cut(slitHoleProfile)
    .cut(slitHoleProfile.mirror([0, 1], [0, 0], "plane"))
    .fuse(slitProfile)
    .fuse(slitProfile.mirror([0, 1], [0, 0], "plane"));

  const cutoutHeight = Math.min(height / 2, 20, width / 2);
  const cutout = draw()
    .hLine(-0.45 * width)
    .bulgeArc(0.05 * width, -cutoutHeight / 2, -0.3)
    .customCorner(width / 5)
    .line(width / 5, -cutoutHeight / 2)
    .customCorner(width / 5)
    .hLineTo(0)
    .closeWithMirror()
    .sketchOnPlane("XZ")
    .extrude(2 * wallThickness)
    .translate([0, wallThickness, height + wallThickness]);

  const tray = sideProfile
    .sketchOnPlane("XY", wallThickness)
    .extrude(height)
    .fuse(bottomTrayProfile.sketchOnPlane("XY").extrude(wallThickness))
    .cut(cutout)
    .cut(endSlitCutout.clone().mirror([1, 0, 0], [0, 0, 0], "plane"))
    .cut(endSlitCutout);

  const baseLidProfile = draw()
    .hLine(width / 2 + wallThickness + slitWidth / 2)
    .line(wallThickness / 2, slitWidth * 0.8)
    .customCorner(wallThickness)
    .bulgeArcTo([width / 2 - wallThickness / 2, wallThickness], 1)
    .customCorner(wallThickness)
    .hLineTo(0)
    .closeWithMirror();

  const lidProfile = baseLidProfile
    .cut(slitHoleProfile)
    .cut(slitHoleProfile.mirror([0, 1], [0, 0], "plane"));

  const lidBackProfile = draw()
    .hLine(width / 2 + wallThickness + slitWidth / 2)
    .vLine(-lidDepth)
    .customCorner(wallThickness)
    .hLineTo(0)
    .closeWithMirror()
    .fuse(baseLidProfile);

  const lid = lidProfile
    .sketchOnPlane("XY", wallThickness)
    .extrude(height + wallThickness)
    .fuse(lidBackProfile.sketchOnPlane("XY").extrude(wallThickness));

  return [
    { shape: tray, name: "Tray" },
    { shape: lid, name: "Lid" },
  ];
}
