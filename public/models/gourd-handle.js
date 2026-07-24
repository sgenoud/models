import {
  pantograph,
  drawShape,
  sketchOnPlane,
  initStudioIntegration,
} from "https://cdn.jsdelivr.net/npm/replicad-pantograph@0.11.3/dist/studio/replicad-pantograph.js";

const { draw, offset } = pantograph;
const { drawRect } = drawShape;

initStudioIntegration();

export const defaultParams = {
  innerSpace: 18.5,
  innerTolerance: 1,
  wheelThickness: 1.75,
  axleThickness: 3,
  borderThickness: 4,
  borderHeight: 8,
  axleRadius: 1.95,
  wheelRadius: 3,
};

export const defaultName = "Gourd Handle";

export default function main({
  innerSpace,
  innerTolerance,
  wheelRadius,
  wheelThickness,
  axleRadius,
  axleThickness,
  borderHeight,
  borderThickness,
}) {
  const innerSize =
    (innerSpace + innerTolerance) / 2 + wheelThickness + axleThickness;
  let pen = draw([innerSize, -wheelRadius]);
  const outline = pen
    .vLine(10)
    .customCorner(borderThickness / 3)
    .line(10, 15)
    .customCorner(borderThickness / 3)
    .bulgeArcTo([-pen.pointer[0], pen.pointer[1]], 0.5)
    .customCorner(borderThickness / 3)
    .line(10, -15)
    .customCorner(borderThickness / 3)
    .vLine(-10)
    .close();

  const base = sketchOnPlane(
    offset(outline, borderThickness)
      .cut(outline.fuse(drawRect(innerSize * 2, 40)))
      .cut(drawRect(100, 40).translateY(-20 - wheelRadius * 1 * 1.22))
  )
    .extrude(borderHeight)
    .fillet(borderHeight / 2 - 0.1, e => e.inDirection("X"))
    .fillet(borderThickness / 3);

  const pinProfile = draw()
    .hLine(axleRadius)
    .vLine(axleThickness)
    .hLine(wheelRadius - axleRadius)
    .vLine(wheelThickness)
    .hLineTo(0)
    .close()
    .rotate(90);

  const pinSlice = sketchOnPlane(drawRect(100, 100))
    .extrude(-100)
    .translateZ(-wheelRadius * 0.7);
  const pin = sketchOnPlane(pinProfile)
    .revolve([1, 0, 0])
    .cut(pinSlice)
    .translate([innerSize, 0, borderHeight / 2]);

  const pin2 = pin.clone().mirror();

  return base.fuse(pin).fuse(pin2);
}
