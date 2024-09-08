/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { drawCircle, asPnt, getOC, GCWithObject, GCWithScope } = replicad;

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

function filter_when(edge_finder, condition) {
  edge_finder.filters.push(condition);
  return edge_finder;
}

function withinDistance(point, distance) {
  const pnt = asPnt(point);

  const oc = getOC();
  const vertexMaker = new oc.BRepBuilderAPI_MakeVertex(pnt);
  const vertex = vertexMaker.Vertex();
  vertexMaker.delete();

  const distanceBuilder = new oc.BRepExtrema_DistShapeShape_1();
  distanceBuilder.LoadS1(vertex);

  const checkPoint = ({ element }) => {
    const r = GCWithScope();
    distanceBuilder.LoadS2(element.wrapped);
    const progress = r(new oc.Message_ProgressRange_1());
    distanceBuilder.Perform(progress);

    return distanceBuilder.Value() - distance < 1e-6;
  };

  GCWithObject(checkPoint)(distanceBuilder);

  return checkPoint;
}

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
    .chamfer(3, e =>
      e.either([e => filter_when(e, withinDistance([0, 0, 0], boltRadius))])
    );
}
