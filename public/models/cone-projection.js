const {
  Transformation,
  drawRoundedRectangle,
  Plane,
  makeSphere,
  drawEllipse,
  loft,
  assembleWire,
} = replicad;

export const defaultParams = {
  x: 20,
  y: 10,
  z: 40,
  majorRadius: 30,
  minorRadius: 15,
};

const O = [0, 0, 0];
const h = 150;

const norm = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
const scale = (factor, x, y, z) => [x * factor, y * factor, z * factor];
const dist = (p1, p2) => {
  return norm(p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]);
};

export default function ({ x, y, z, majorRadius, minorRadius }) {
  const p = [x, y, z];
  const base = drawEllipse(majorRadius, minorRadius).sketchOnPlane("XY", h);
  const cone = loft([base.wire.clone()], {
    startPoint: O,
  });
  const point = makeSphere(1).translate(...p);
  const apex = makeSphere(1);
  const perpShere = makeSphere(dist(p, O) / 2).translate(...scale(0.5, ...p));

  const tPlane = new Plane(p, [-1, 0, 0], p);

  const intersections = cone.clone().intersect(perpShere);
  const sphereConeIntersection = assembleWire([
    intersections.edges[1],
    intersections.edges[4],
  ]);

  const transformation = new Transformation();
  transformation.coordSystemChange(tPlane, "reference");

  const rect = drawRoundedRectangle(1000, 1000).sketchOnPlane(tPlane).face();
  const projectedCurve = assembleWire(cone.clone().intersect(rect).wires);

  return [
    {
      name: "curve C'",
      shape: projectedCurve,
      color: "green",
    },
    { name: "orthogonal by P", shape: sphereConeIntersection, color: "red" },

    { name: "P", shape: point },
    { name: "0", shape: apex },
    { name: "C", shape: base.wire },
  ];
}
