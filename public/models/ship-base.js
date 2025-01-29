/** @typedef { typeof import("replicad") } replicadLib */

const { draw, drawRoundedRectangle } = replicad;

export const defaultParams = {
  pinDiameter: 4.8,
  innerPinHeight: 12,
  baseHeight: 80,
  baseWidth: 30,
  baseThickness: 2,
  pinSpacing: 41,
};

export const defaultName = "Ship base";

export default function main({
  pinDiameter,
  innerPinHeight,
  baseHeight,
  baseWidth,
  baseThickness,
  pinSpacing,
}) {
  const pin = draw()
    .hLine(pinDiameter / 2 + 2)
    .vLine(2)
    .customCorner(0.5, "chamfer")
    .hLine(-2)
    .vLine(innerPinHeight)
    .customCorner(pinDiameter / 4)
    .hLineTo(0)
    .close()
    .sketchOnPlane("XZ")
    .revolve();
  const baseDrawing = drawRoundedRectangle(
    baseWidth,
    baseHeight,
    baseWidth / 3
  );
  const base = baseDrawing
    .sketchOnPlane("XY")
    .loftWith(
      baseDrawing.offset(-baseThickness / 2).sketchOnPlane("XY", baseThickness)
    );

  return base
    .fuse(pin.clone().translate(0, pinSpacing / 2, baseThickness))
    .fuse(pin.clone().translate(0, -pinSpacing / 2, baseThickness));
}
