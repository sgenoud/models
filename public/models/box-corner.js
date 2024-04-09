const { Sketcher, makePlaneFromFace, EdgeFinder, FaceFinder } = replicad;

const defaultParams = {
  cardboardThickness: 2,
  wallThickness: 1.8,
  height: 5,
  length: 20,
};

const shape = ({
  length,
  wallThickness,
  cardboardThickness,
  height,
} = defaultParams) => {
  const overhang = wallThickness;
  const sideSize = 2 * wallThickness + cardboardThickness + overhang;

  const base = new Sketcher()
    .vLine(length - sideSize)
    .hLine(length - sideSize)
    .vLine(sideSize)
    .hLine(-length)
    .vLine(-length)
    .hLine(sideSize)
    .close()
    .extrude(wallThickness);

  const topFace = new FaceFinder()
    .parallelTo("XY")
    .containsPoint([0, 0, wallThickness])
    .find(base, { unique: true });

  const fence = new Sketcher(makePlaneFromFace(topFace, [0, 0]))
    .vLine(length)
    .hLine(length)
    .vLine(-wallThickness)
    .hLine(-length + wallThickness)
    .vLine(-length + wallThickness)
    .close()
    .extrude(height);

  const bottomFace = new FaceFinder()
    .parallelTo("XY")
    .containsPoint([0, 0, 0])
    .find(base, { unique: true });

  const bottomPlane = makePlaneFromFace(bottomFace, [0, 0]);

  const outerClipSize = length - sideSize;
  const outerClip = new Sketcher(bottomPlane)
    .movePointerTo([sideSize - wallThickness, 0])
    .vLine(-outerClipSize - wallThickness)
    .hLine(outerClipSize + wallThickness)
    .vLine(wallThickness)
    .hLine(-outerClipSize)
    .vLine(outerClipSize)
    .close()
    .extrude(height);

  const innerClipSize = length - sideSize + wallThickness + cardboardThickness;
  const innerClip = new Sketcher(bottomPlane)
    .movePointerTo([sideSize - 2 * wallThickness - cardboardThickness, 0])
    .vLine(-innerClipSize - wallThickness)
    .hLine(innerClipSize + wallThickness)
    .vLine(wallThickness)
    .hLine(-innerClipSize)
    .vLine(innerClipSize)
    .close()
    .extrude(height);

  const innerEdgesFinder = new EdgeFinder()
    .parallelTo("XY")
    .containsPoint([0, length - sideSize, wallThickness]);

  const overhangEdgesFinder = new EdgeFinder()
    .parallelTo("XY")
    .containsPoint([
      -2 * wallThickness - cardboardThickness - overhang,
      length,
      0,
    ]);

  const paperEdgesFinder = new EdgeFinder()
    .parallelTo("XY")
    .either([
      f =>
        f.containsPoint([-wallThickness, length - sideSize + wallThickness, 0]),
      f =>
        f.containsPoint([
          -wallThickness - cardboardThickness,
          length - sideSize + wallThickness + cardboardThickness,
          0,
        ]),
    ]);

  const topExtremitiesEdgesFinder = new EdgeFinder()
    .either([
      f => f.inPlane("XY", -height),
      f => f.inPlane("XY", height + wallThickness),
    ])
    .either([f => f.inPlane("XZ"), f => f.inPlane("YZ", length - sideSize)]);

  const built = base
    .fuse(fence)
    .fuse(outerClip)
    .fuse(innerClip)
    .chamfer({
      filter: paperEdgesFinder,
      radius: cardboardThickness / 2 - 1e-3,
    })
    .chamfer({ filter: overhangEdgesFinder, radius: overhang })
    .chamfer({
      filter: topExtremitiesEdgesFinder,
      radius: height - wallThickness / 2,
    })
    .chamfer({ filter: innerEdgesFinder, radius: wallThickness / 2 })
    .translate([0, -length + sideSize, height]);

  return built;
};

const main = config => {
  return [{ shape: shape(config), name: "box-corner" }];
};

export { defaultParams };
export default main;
