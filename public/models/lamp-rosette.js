/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { drawCircle, draw } = replicad;

export const defaultParams = {
  outerRadius: 90,
  depth: 22,
  wallThickness: 1.6,

  cableHoleRadius: 5,

  screwDiameter: 4,
  screwPosition: 60,
  screwSlitLength: 10,

  screwSlitOnly: false,
};

const drawPill = (width, height) => {
  const w = width - height;
  return draw([-w / 2, -height / 2])
    .hLine(w)
    .vBulgeArc(height, 1)
    .hLine(-w)
    .vBulgeArc(-height, 1)
    .close();
};

export default function main({
  outerRadius,
  depth,
  wallThickness,

  cableHoleRadius,

  screwDiameter,
  screwSlitLength,
  screwPosition,

  screwSlitOnly,
}) {
  const fixHoleBase = drawPill(screwSlitLength, screwDiameter);
  const fixHeadBase = fixHoleBase.offset(2);
  const fixOuterBase = fixHeadBase.offset(wallThickness);
  const fixHoleTop = fixHoleBase.offset(3);
  const fixOuterTop = fixOuterBase.offset(3);

  const fix = fixOuterTop
    .sketchOnPlane("XY")
    .loftWith(fixOuterBase.sketchOnPlane("XY", depth));

  const fixHole = fixHoleTop
    .sketchOnPlane("XY")
    .loftWith(fixHeadBase.sketchOnPlane("XY", depth - wallThickness))
    .fuse(fixHoleBase.sketchOnPlane().extrude(depth));

  if (screwSlitOnly) {
    return {
      shape: fix.cut(fixHole),
      name: "Rosette screw slit only",
    };
  }
  const cableHole = drawCircle(cableHoleRadius).sketchOnPlane().extrude(depth);

  const slitPosition1 = [screwPosition, 0, 0];
  const slitPosition2 = [-screwPosition, 0, 0];

  const shape = drawCircle(outerRadius)
    .sketchOnPlane()
    .extrude(depth)
    .chamfer(3, e => e.inPlane("XY"))
    .fillet(3, e => e.inPlane("XY", 3))
    .shell(wallThickness, f => f.inPlane("XY", depth))
    .cut(cableHole)
    .fuse(fix.clone().translate(slitPosition2))
    .cut(fixHole.clone().translate(slitPosition2))
    .fuse(fix.rotate(90).translate(slitPosition1))
    .cut(fixHole.rotate(90).translate(slitPosition1))
    .chamfer(3, e =>
      e
        .inPlane("XY", wallThickness)
        .either([
          e => e.withinDistance(10, slitPosition1),
          e => e.withinDistance(10, slitPosition2),
        ])
    );

  return {
    shape,
    name: "Rosette",
  };
}
