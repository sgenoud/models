const { Sketcher, FaceFinder, makePlaneFromFace } = replicad;

const defaultParams = {
  wallThickness: 2,
  height: 50,
  width: 20,
  hangerDepth: 20,
  handerHeight: 25,
  hookHeight: 20,
  hookDepth: 15,
};

const simpleHook = ({
  height: totalHeight,
  width,
  hangerDepth,
  handerHeight,
  hookHeight,
  hookDepth,
  wallThickness,
} = defaultParams) => {
  const height = Math.max(
    totalHeight - hookDepth / 2 - wallThickness,
    wallThickness
  );

  const hookFlatPart = hookHeight - hookDepth / 2;
  let shape = new Sketcher()
    .vLine(height)
    .hSagittaArc(hookDepth, -hookDepth / 2)
    .vLine(-hookFlatPart)
    .hLine(wallThickness)
    .vLine(hookFlatPart)
    .hSagittaArc(-hookDepth - 2 * wallThickness, hookDepth / 2 + wallThickness)
    .vLine(-height + wallThickness)
    .hLine(-hangerDepth)
    .vLine(handerHeight)
    .hLine(-wallThickness)
    .vLine(-handerHeight - wallThickness)
    .close()
    .extrude(width);

  const hookFace = new FaceFinder()
    .parallelTo("YZ")
    .containsPoint([hookDepth + wallThickness, height, width / 2])
    .find(shape, { clean: true, unique: true });

  // This means the arc never has an angle higher than 45 degrees (note that
  // the limit value is (sqrt(2) - 1 / 2)
  const sagitta = Math.min(hookFlatPart / 3, width / 5);
  const cutout = new Sketcher(makePlaneFromFace(hookFace, [0, 0]))
    .hLine(sagitta)
    .vSagittaArc(-width, sagitta)
    .hLine(-sagitta)
    .close()
    .extrude(-wallThickness);

  return shape.cut(cutout).chamfer(wallThickness / 5);
};

export default function main(config) {
  return { shape: simpleHook(config), name: "hanger-hook" };
}

export { defaultParams };
