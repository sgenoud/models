/* global replicad */
/** @typedef { typeof import("replicad") } replicad */

const { draw } = replicad;

export const defaultParams = {
  length: 150,
  innerHeight: 25,
  wallThickness: 2.4,
  innerWidth: 20,
};

export default function main({
  length,
  innerHeight,
  wallThickness,
  innerWidth,
}) {
  const outerHeight = innerHeight + wallThickness * 2;
  const outerWidth = innerWidth + wallThickness;

  const radius = wallThickness / 2.5;
  const bigRadius = wallThickness;

  return {
    shape: draw()
      .vLine(outerHeight)
      .hLine(outerWidth)
      .vLine(-wallThickness)
      .customCorner(radius)
      .hLine(-innerWidth)
      .customCorner(bigRadius)
      .vLine(-innerHeight)
      .customCorner(bigRadius)
      .hLine(innerWidth)
      .customCorner(radius)
      .vLine(-wallThickness)
      .customCorner(radius)
      .hLine(-outerWidth)
      .closeWithCustomCorner(radius)
      .sketchOnPlane("XZ")
      .extrude(length),
    name: "Bracket",
  };
}
