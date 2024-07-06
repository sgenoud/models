/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { drawCircle } = replicad;

export const defaultParams = {
  totalHeight: 13,
  borderHeight: 1,
  borderWidth: 2,
  innerDiameter: 9,
  outerDiameter: 12,
};

export default ({
  totalHeight,
  borderHeight,
  borderWidth,
  innerDiameter,
  outerDiameter,
}) => {
  const outerRadius = outerDiameter / 2;
  const innerRadius = innerDiameter / 2;

  return drawCircle(outerRadius + borderWidth)
    .sketchOnPlane()
    .extrude(borderHeight)
    .fuse(drawCircle(outerRadius).sketchOnPlane().extrude(totalHeight))
    .cut(drawCircle(innerRadius).sketchOnPlane().extrude(totalHeight));
};
