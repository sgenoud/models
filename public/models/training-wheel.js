/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { drawCircle } = replicad;

export const defaultParams = {
  outerRadius: 50,
  depth: 30,
  boltRadius: 10,
  boltHoleRadius: 5.5,
  boltDepth: 10,

  endcapWidth: 1.6,
  endcapHeight: 4,

  wheelFillet: 3,
};

export default function main({
  outerRadius,
  depth,
  boltRadius,
  boltHoleRadius,
  boltDepth,
  endcapWidth,
  endcapHeight,
  wheelFillet,
}) {
  return drawCircle(outerRadius)
    .sketchOnPlane()
    .extrude(depth)
    .chamfer(wheelFillet)
    .fuse(
      drawCircle(boltHoleRadius + endcapWidth + endcapHeight)
        .sketchOnPlane("XY", depth)
        .extrude(endcapHeight)
        .chamfer(endcapHeight - 1e-9, e =>
          e.inPlane("XY", depth + endcapHeight)
        )
    )
    .cut(drawCircle(boltRadius).sketchOnPlane("XY").extrude(boltDepth))
    .cut(
      drawCircle(boltHoleRadius)
        .sketchOnPlane()
        .extrude(depth + endcapHeight)
    )
    .chamfer(3, e => e.either([e => e.withinDistance(boltRadius, [0, 0, 0])]));
}
