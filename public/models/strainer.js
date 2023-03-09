const { draw, drawCircle } = replicad;

export const defaultParams = {
  totalHeight: 25,
  radius: 24,
  bottomThickness: 2,
  slicesCount: 22,
  detailSize: 2,
  innerNutRadius: 7.8,
  innerNutHeight: 3.6,
};

export default function main({
  totalHeight,
  radius,
  bottomThickness,
  slicesCount,
  detailSize,
  innerNutHeight,
  innerNutRadius,
}) {
  const topRadius = 4;
  const profile = draw([0, 0])
    .hLine(radius)
    .customCorner(detailSize / 2, "chamfer")
    .vLine(bottomThickness + detailSize)
    .customCorner(detailSize / 3)
    .hLine(-detailSize)
    .customCorner(detailSize / 3)
    .line(-2 * detailSize, -detailSize)
    .hLineTo(topRadius)
    .customCorner(Math.max(radius / 4, innerNutRadius + detailSize), "chamfer")
    .vLineTo(totalHeight - topRadius)
    .tangentArc(-topRadius, topRadius)
    .close();

  const outerHoleRadius = radius - 1.2 * detailSize;
  let slice = drawCircle(outerHoleRadius).cut(drawCircle(2 * topRadius));

  const triangles = draw([0, 0])
    .hLine(radius)
    .polarLineTo([radius, 360 / slicesCount])
    .close();

  for (let i = 0; i < slicesCount; i++) {
    slice = slice.cut(triangles.rotate((720 / slicesCount) * i));
  }
  const holes = slice
    .cut(triangles)
    .sketchOnPlane()
    .extrude(totalHeight)
    .fillet(1, (e) => e.atDistance(outerHoleRadius).inDirection("Z"));

  const basicShape = profile
    .sketchOnPlane("XZ")
    .revolve()
    .cut(holes)
    .chamfer(detailSize / 2, (e) =>
      e.inPlane("XY", bottomThickness).ofCurveType("LINE")
    );

  if (!innerNutRadius || !innerNutHeight) {
    return basicShape;
  }

  const nutHole = draw()
    .hLine(innerNutRadius + innerNutHeight)
    .line(-innerNutHeight, innerNutHeight)
    .hLineTo(0)
    .close()
    .sketchOnPlane("XZ")
    .revolve();

  return basicShape.cut(nutHole);
}
