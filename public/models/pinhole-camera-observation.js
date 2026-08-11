import { drawRoundedRectangle, drawCircle, DEG2RAD, draw } from "replicad";

export const defaultParams = {
  radius: 17.5,
  angle: 45,
  height: 60,
  pipeHeight: 50,
  wall: 1.2,
  ringHeight: 20,
};

const conduit = (radius, pipeHeight, ringHeight, wall) => {
  const border = draw([radius + 0.01, pipeHeight - wall - ringHeight])
    .vLine(wall)
    .hLine(-wall)
    .close()
    .sketchOnPlane("YZ")
    .revolve();

  return drawCircle(radius)
    .sketchOnPlane()
    .extrude(pipeHeight)
    .shell(-wall, f => f.parallelTo("XY"))
    .fuse(border);
};

export default function main({
  radius,
  angle,
  height,
  pipeHeight,
  wall,
  ringHeight,
}) {
  const alpha = angle * DEG2RAD;
  console.log("h", height * Math.sin(alpha));

  const c2 = drawCircle(radius - 0.1)
    .sketchOnPlane()
    .extrude(pipeHeight)
    .translate([0, 0, wall]);
  const dir = [0, Math.sin(alpha), Math.cos(alpha)];
  const body = drawRoundedRectangle(3 * radius, 2.5 * radius)
    .sketchOnPlane()
    .extrude(height, {
      extrusionDirection: dir,
    })
    .fillet(3, e => e.inDirection(dir));

  const c = conduit(radius, pipeHeight, ringHeight, wall).cut(body);
  const test = conduit(radius, 10, 5, wall);

  const main = body
    .shell(wall, f => f.parallelTo("XY").not(f => f.inPlane("XY", 0)))
    .cut(c2)
    .fuse(c);

  return [
    { shape: main, name: "Observation Window" },
    { shape: test, name: "Fitting test" },
  ];
}
