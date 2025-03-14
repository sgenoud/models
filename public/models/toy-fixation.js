/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { draw, drawCircle } = replicad;

export const defaultParams = {
  width: 40,
  height: 16,
  pinBumpSize: 1,
  totalPinDiameter: 11,
  pinDistance: 22,
  pinHeight: 7,
  baseThickness: 1,
  slantHeight: 2,
  slitWidth: 1,
  slitClearance: 0.2,
  slitHeight: 10,
};

function pill(width, height) {
  const radius = height / 2;
  return draw([width / 2 - radius, -radius])
    .bulgeArc(0, height, 1)
    .hLine(-width + height)
    .bulgeArc(0, -height, 1)
    .close();
}

function pin(totalRadius, bumpSize) {
  const radius = totalRadius - bumpSize;
  const base = drawCircle(radius);
  const bump = drawCircle(bumpSize);

  return base
    .fuse(bump.translate(0, radius))
    .fuse(bump.translate(0, -radius))
    .fuse(bump.translate(-radius, 0));
}

function slit(width, height) {
  const topWidth = width;
  const bottomWidth = width + 2 * height;
  return draw([topWidth / 2, 0])
    .vLine(0.2)
    .line(height - 0.2, height - 0.2)
    .hLine(-bottomWidth + 0.4)
    .line(height - 0.2, -height + 0.2)
    .vLine(-0.2)
    .close();
}

function side(width, height) {
  return draw()
    .hLine(width / 2)
    .line(-height / 4, height)
    .customCorner(1)
    .hLine(-width + height / 2)
    .customCorner(1)
    .line(-height / 4, -height)
    .close();
}

export default function main({
  width,
  height,
  pinBumpSize,
  pinDistance,
  totalPinDiameter,
  pinHeight,
  baseThickness,
  slantHeight,
  slitWidth,
  slitClearance,
  slitHeight,
}) {
  const singlePin = pin(totalPinDiameter / 2, pinBumpSize)
    .sketchOnPlane()
    .extrude(pinHeight);
  const baseDrawing = pill(width, height);
  const baseTopDrawing = pill(
    width - slantHeight * 2,
    height - slantHeight * 2
  );

  const base = baseTopDrawing
    .sketchOnPlane()
    .loftWith([
      baseDrawing.sketchOnPlane("XY", slantHeight),
      baseDrawing.sketchOnPlane("XY", baseThickness + slantHeight),
    ]);

  const slitDrawing = slit(slitWidth, slantHeight);
  const slitShape = slitDrawing
    .offset(slitClearance)
    .sketchOnPlane("YZ", -width / 2)
    .extrude(width);

  const sideLength = width - 4 * slitWidth;
  return [
    {
      shape: base
        .cut(slitShape)
        .fuse(
          singlePin
            .clone()
            .translate(-pinDistance / 2, 0, baseThickness + slantHeight)
        )
        .fuse(
          singlePin
            .clone()
            .rotate(180)
            .translate(pinDistance / 2, 0, baseThickness + slantHeight)
        ),
      name: "Fixation",
    },

    {
      shape: slitDrawing
        .mirror([1, 0], [0, 0], "plane")
        .sketchOnPlane("YZ", -sideLength / 2)
        .extrude(sideLength)
        .fuse(
          side(width - 4 * slitWidth, slitHeight)
            .sketchOnPlane("XZ", -slitWidth / 2)
            .extrude(slitWidth)
        )
        .translate(0, 0, slantHeight),
      name: "Decoration",
    },
  ];
}
