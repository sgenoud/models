/** @typedef { typeof import("replicad") } replicadLib */

/** @type {replicadLib} */
const { makeCylinder, draw, drawPolysides, drawRoundedRectangle } = replicad;

import {
  makeThread,
  metricThreadProfileConfig,
  metricThreadConfigConjugate,
} from "https://cdn.jsdelivr.net/npm/replicad-threads@latest/dist/studio/replicad-threads.js";

export const defaultParams = {
  nut: false,
  height: 30,
  totalRadius: 5,
  pitch: 2.5,
  tolerance: 0.2,
  additionalHeight: 40,
  boltHeadSize: 26,
  boltHeadHeight: 3.6,
};

export const defaultName = "Bolt and Nut";

export default function main({
  nut,
  pitch,
  totalRadius,
  height,
  tolerance,
  additionalHeight,
  boltHeadSize,
  boltHeadHeight,
}) {
  const profileConfig = metricThreadProfileConfig(pitch, true);

  const radius = totalRadius - profileConfig.toothHeight;

  const config = {
    ...profileConfig,
    radius,
    height,
  };

  const shapes = [];

  const baseRadius = Math.ceil(radius + config.toothHeight + tolerance + 5);

  const boltThread = makeThread(config);

  let boltCore = draw().hLine(totalRadius);
  if (additionalHeight > 0) {
    boltCore = boltCore
      .vLine(additionalHeight - config.toothHeight)
      .line(-config.toothHeight, config.toothHeight);
  }
  boltCore = boltCore.vLine(height + 4).hLineTo(0);
  const boltCoreShape = boltCore.close().sketchOnPlane("XZ").revolve();

  const boltShape = boltThread
    .translate([0, 0, 2 + additionalHeight])
    .fuse(boltCoreShape, {
      optimization: "commonFace",
    })
    .translate([0, 0, boltHeadHeight])
    .fuse(
      drawRoundedRectangle(boltHeadSize, boltHeadSize)
        .sketchOnPlane()
        .extrude(boltHeadHeight)
        .chamfer(1, e => e.parallelTo("XY"))
    );

  const sideCut = drawRoundedRectangle(boltHeadSize * 2, boltHeadSize * 2)
    .translate(boltHeadSize + radius * 0.8)
    .sketchOnPlane()
    .extrude(height + additionalHeight + 10);

  shapes.push({ shape: boltShape.cut(sideCut), name: "Bolt" });

  if (nut) {
    const nutHeight = 5;

    let nutConfig = metricThreadConfigConjugate(config, tolerance);

    const nutThread = makeThread({
      ...nutConfig,
      height: nutHeight,
    });

    const nutShape = drawPolysides(baseRadius, 6)
      .sketchOnPlane()
      .extrude(nutHeight + 4)
      .chamfer(1, e => e.parallelTo("XY"))
      .cut(makeCylinder(nutConfig.radius, nutHeight + 4))
      .fuse(nutThread.translate([0, 0, 2]));

    shapes.push({ shape: nutShape, name: "Nut" });
  }
  return shapes;
}
