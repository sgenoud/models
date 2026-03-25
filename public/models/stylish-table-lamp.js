/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { draw, drawRoundedRectangle, drawCircle } = replicad;

export const defaultParams = {
  width: 80,
  height: 145,
  circleTolerance: 0.3,
  thickness: 8,
  margin: 5,

  mortiseHeight: 20,
  mortiseTolerance: 0.2,

  lampDiameter: 45,
  footHeight: 12,
  bottomThickness: 5,
};

function rotatingPin(pinRadius, pinHeight) {
  const chamferRadius = Math.max(
    Math.min(pinRadius / 2, 2),
    pinRadius / 2 - 0.1
  );
  const pin = draw()
    .hLine(pinRadius)
    .vLine(pinHeight - chamferRadius)
    .line(-chamferRadius, chamferRadius)
    .hLineTo(0)
    .close()
    .sketchOnPlane("YX")
    .revolve([1, 0, 0]);

  const support = drawCircle(0.4)
    .sketchOnPlane()
    .extrude(pinHeight / 2)
    .translateX(pinHeight - chamferRadius);

  return [pin, support];
}

function foot(
  lampDiameter = 45,
  width = 80,
  wallHeight = 20,
  totalHeight = 30,
  thickness = 5,
  bottomThickness = 10
) {
  const wirePathThickness = 10;

  const base = draw()
    .hLine(width / 2)
    .vLine(2 * thickness)
    .customCorner(thickness / 2)
    .hLine(-width / 2 + lampDiameter / 2 + thickness)
    .customCorner(thickness)
    .vLine(lampDiameter + thickness)
    .customCorner(lampDiameter / 2 + thickness - 1)
    .hLineTo(0)
    .closeWithMirror()
    .sketchOnPlane()
    .extrude(wallHeight + bottomThickness);

  const hole = drawCircle(lampDiameter / 2)
    .sketchOnPlane("XY", bottomThickness)
    .extrude(wallHeight + bottomThickness)
    .translateY(lampDiameter / 2 + thickness * 2);

  const wall = drawRoundedRectangle(width, thickness)
    .translate(0, thickness / 2)
    .sketchOnPlane("XY")
    .extrude(totalHeight);

  const holeMargin = 6;

  const cableHole = drawRoundedRectangle(
    wirePathThickness,
    thickness * 4 + lampDiameter,
    4
  )
    .sketchOnPlane()
    .extrude(bottomThickness + holeMargin)
    .fillet(thickness * 0.4, e => e.inPlane("XY", bottomThickness + holeMargin))
    .translateY(lampDiameter + thickness * 4 - wirePathThickness);

  return wall
    .fuse(base)
    .cut(hole)
    .fillet(thickness / 3, e => e.inPlane("XY", wallHeight + bottomThickness))
    .cut(cableHole)
    .fillet(2, e =>
      e.either([
        e => e.inPlane("XY", bottomThickness),
        e => e.inPlane("XY", bottomThickness + holeMargin),
      ])
    );
}

function mortiseSlot(totalThickness, mortiseWidth, mortiseHeight, tolerance) {
  const slot = draw([-mortiseWidth / 2, 0])
    .line(totalThickness / 4, totalThickness / 4)
    .hLine(mortiseWidth - totalThickness / 2)
    .line(totalThickness / 4, -totalThickness / 4)
    .closeWithMirror();

  if (!tolerance) return slot;
  return slot.offset(-tolerance);
}

function mortisePositions(width, solidWidth = 30) {
  const nSlots = Math.floor(width / (2 * solidWidth)) + 1;
  const spacing = (width - nSlots * solidWidth) / (nSlots - 1);

  const positionStart = -width / 2 + solidWidth / 2;

  return Array.from(
    { length: nSlots },
    (_, i) => positionStart + i * (solidWidth + spacing)
  );
}

const tenons = (
  width,
  thickness,
  height,
  mortiseTolerance,
  mortiseWidth = 20
) => {
  const availableWidth = width - 2 * thickness;

  const mortisePositionsList =
    availableWidth < 2 * mortiseWidth + thickness
      ? [0]
      : mortisePositions(availableWidth, mortiseWidth);

  const tenon = mortiseSlot(thickness, mortiseWidth, height, mortiseTolerance)
    .sketchOnPlane("XY")
    .extrude(height - 2 * mortiseTolerance)
    .chamfer(thickness / 6 - mortiseTolerance, e =>
      e.inPlane("XY", height - 2 * mortiseTolerance)
    );

  const tenons = mortisePositionsList.map(position => {
    return tenon.clone().translateX(position);
  });

  return tenons.reduce((acc, tenon) => (acc ? acc.fuse(tenon) : acc));
};

const mortises = (width, thickness, height, mortiseWidth = 20) => {
  const availableWidth = width - 2 * thickness;

  const mortisePositionsList =
    availableWidth < 2 * mortiseWidth + thickness
      ? [0]
      : mortisePositions(availableWidth, mortiseWidth);

  const mortise = mortiseSlot(thickness, mortiseWidth, height, 0)
    .sketchOnPlane("XY")
    .extrude(height);

  const mortises = mortisePositionsList.map(position => {
    return mortise.clone().translateX(position);
  });

  return mortises.reduce((acc, tenon) => (acc ? acc.fuse(tenon) : acc));
};

/*
  const b = 5;
  const w = 70;
  const t = 8;
  const h = 15;

  const tenonTest = drawRoundedRectangle(w, t, 1)
    .sketchOnPlane()
    .extrude(b)
    .fuse(tenons(w, t, h, 0.2).translateZ(b));

  const mortiseTest = drawRoundedRectangle(w, t, 1)
    .sketchOnPlane()
    .extrude(b + h)
    .cut(mortises(w, t, h).translateZ(b))
    .rotate(90, [0, 0, 0], [1, 0, 0])
    .translateZ(t / 2);
*/

export default function main({
  width,
  height,
  circleTolerance,
  thickness,
  margin,

  mortiseHeight,
  mortiseTolerance,

  lampDiameter,
  bottomThickness,
  footHeight,
}) {
  const outerRadius = width / 2 - margin;

  const topHeight = width + thickness + mortiseHeight;
  const bottomHeight = height - topHeight;

  let face = drawRoundedRectangle(width, topHeight);
  const circle = drawCircle(outerRadius).translate(
    0,
    topHeight / 2 - width / 2
  );
  face = face.cut(circle).sketchOnPlane().extrude(thickness);

  const pinRadius = thickness / 4;
  const [innerPin, support] = rotatingPin(pinRadius, margin + circleTolerance);
  const outerPin = rotatingPin(
    pinRadius + 0.4,
    margin + circleTolerance + 0.4
  )[0];
  //innerPin.clone().scale((pinRadius + 0.4) / pinRadius);
  const placedPinHole = outerPin
    .clone()
    .translate(
      outerRadius - margin / 2,
      topHeight / 2 - width / 2,
      thickness / 2
    );
  const secondPinHole = placedPinHole.clone().mirror("YZ");

  face = face.cut(placedPinHole).cut(secondPinHole);

  const innerCircle = drawCircle(outerRadius - circleTolerance);
  let mirror = innerCircle
    .sketchOnPlane()
    .extrude(thickness)
    .chamfer(thickness / 3);

  const placedPin = innerPin
    .clone()
    .translateZ(thickness / 2)
    .fuse(support)
    .translateX(outerRadius - margin / 2);

  const secondPin = placedPin.clone().mirror("YZ");
  mirror = mirror.fuse(placedPin).fuse(secondPin);

  const ridgeDepth = 0.8;

  const topMortises = mortises(width, thickness, mortiseHeight)
    .rotate(-90, [0, 0, 0], [1, 0, 0])
    .translate(0, -topHeight / 2, thickness / 2);
  const top = face
    .chamfer(ridgeDepth, e => e.inPlane("XZ", topHeight / 2))
    .fuse(mirror.translate(0, topHeight / 2 - width / 2))
    .cut(topMortises);

  const bottomTenons = tenons(
    width,
    thickness,
    mortiseHeight,
    mortiseTolerance
  ).translate(0, thickness / 2, bottomHeight);

  let bottom = foot(
    lampDiameter,
    width,
    footHeight,
    bottomHeight,
    thickness,
    bottomThickness
  ).chamfer(ridgeDepth, e => e.inPlane("XY", bottomHeight));

  bottom = bottom.fuse(bottomTenons);

  return [
    bottom,
    top
      .rotate(90, [0, 0, 0], [1, 0, 0])
      .translate(0, thickness, topHeight / 2 + bottomHeight),
  ];
}
