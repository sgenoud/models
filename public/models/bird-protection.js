import { drawRoundedRectangle, draw } from "replicad";

export const defaultParams = {
  width: 250,
  height: 160,
  depth: 20,
  bottomThickness: 0.4,
  wallThickness: 1.2,
  sideClearance: 20,
  border: 1.6,

  cutWidth: 10,
  cutDepth: 15,
  cutOffset: 0,
};

export default function main(p) {
  const base = drawRoundedRectangle(
    p.width,
    p.height,
    Math.min(p.sideClearance / 2, 20)
  );

  const crossSide = drawRoundedRectangle(1, Math.max(p.width, p.height) * 1.5)
    .rotate(45)
    .intersect(base);
  const cross = crossSide.fuse(crossSide.mirror([0, 1], [0, 0], "plane"));
  let shape = base.sketchOnPlane().extrude(p.bottomThickness).asShape3D();

  const border = base.cut(base.offset(-p.border)).fuse(cross);
  shape = shape.fuse(border.sketchOnPlane().extrude(p.border).asShape3D());

  const w = p.width - p.sideClearance * 2;
  const h = p.depth;

  const wall = draw([-w / 2, 0])
    .hLine(w)
    .vLine(h)
    .customCorner(5)
    .hLine(-w)
    .customCorner(5)
    .close()
    .sketchOnPlane("XZ", p.height / 2 - p.wallThickness)
    .extrude(p.wallThickness)
    .asShape3D();

  shape = shape.fuse(wall.clone().mirror("XZ")).fuse(wall);

  if (p.cutWidth) {
    const d = p.cutDepth ?? 20;
    const baseCut = draw([-p.cutWidth / 2, 0])
      .hLine(p.cutWidth)
      .vLine(d)
      .bulgeArc(-p.cutWidth, 0, 1)
      .close();

    const sideCut = baseCut
      .translate(p.cutOffset, -p.height / 2)
      .sketchOnPlane()
      .extrude(h)
      .asShape3D();

    const additionalBorder = baseCut
      .offset(p.wallThickness)
      .cut(baseCut)
      .cut(
        drawRoundedRectangle(p.cutWidth * 2, p.cutWidth * 2).translate(
          0,
          -p.cutWidth
        )
      )
      .translate(p.cutOffset, -p.height / 2)
      .sketchOnPlane()
      .extrude(p.border)
      .asShape3D();

    shape = shape
      .cut(sideCut)
      .fuse(additionalBorder)
      .asShape3D()
      .fillet(5, e => e.inPlane("XY", h).inDirection("Y"));
  }

  return shape.chamfer(p.wallThickness / 2, e => e.inPlane("XY"));
}
