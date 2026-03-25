/** global replicad */
/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { draw } = replicad;

export const defaultParams = {
  outerDiameter: 22,
  innerDiameter: 20,
  tolerance: -0.2,
  bottomHeight: 4,
  margin: 2,
};

/**
 * @param {typeof defaultParams} params
 */
export default function main({
  outerDiameter,
  innerDiameter,
  tolerance,
  bottomHeight,
  margin,
}) {
  const diameterDiff = outerDiameter - innerDiameter + tolerance;
  const chamfer = bottomHeight / 3;
  return draw()
    .hLine(outerDiameter / 2 - chamfer)
    .line(chamfer, chamfer)
    .vLine(bottomHeight - chamfer)
    .hLine(-diameterDiff / 2 - margin)
    .line(margin, margin)
    .vLine(0.5)
    .line(-margin, margin)
    .line(margin, margin)
    .vLine(0.5)
    .line(-margin, margin)
    .line(margin, margin)
    .vLine(0.5)
    .hLineTo(0)
    .close()
    .sketchOnPlane("XZ")
    .revolve();
}
