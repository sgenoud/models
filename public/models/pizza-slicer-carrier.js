/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { draw, Vector, Plane, drawRoundedRectangle } = replicad;

export const defaultParams = {
  thickness: 3,
  cornerRadius: 5,
  width: 50,
  height: 30,
  slitThickness: 2,
  slitHeight: 5,
};

export const defaultName = "Pizza Slicer Carrier";

const planeFromPoints = (origin, xAxisPoint, p3) => {
  const o = new Vector(origin);
  const xAxis = new Vector(xAxisPoint).sub(o);
  const vector = new Vector(p3).sub(o);

  const zAxis = xAxis.cross(vector).normalize();

  return new Plane(o, xAxis, zAxis);
};

export default function main({
  thickness,
  cornerRadius,
  width,
  height,
  slitThickness,
  slitHeight,
}) {
  const side = draw([-width / 2, 0])
    .lineTo([0, height])
    .customCorner(cornerRadius)
    .lineTo([width / 2, 0])
    .hLine(-thickness)
    .lineTo([0, height - thickness])
    .customCorner(cornerRadius - thickness / 2)
    .lineTo([-width / 2 + thickness, 0])
    .close();

  const p1 = planeFromPoints([0, -15, 0], [1, -15, 0], [0, -10, height]);
  const p2 = planeFromPoints([0, 15, 0], [1, 15, 0], [0, 10, height]);

  let shape = side
    .sketchOnPlane(p1)
    .loftWith(side.sketchOnPlane(p2))
    .chamfer(thickness / 5, e => e.not(e => e.inPlane("XY")));

  const slit = drawRoundedRectangle(width, height)
    .sketchOnPlane("XZ", -slitThickness / 2)
    .extrude(slitThickness)
    .translateZ(height / 2 + slitHeight)
    .fillet(slitThickness / 3);

  return shape.cut(slit);
}
