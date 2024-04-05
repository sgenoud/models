 const { drawRoundedRectangle, draw, drawCircle } = replicad; 
  
const innerWidth = 18;
const half = innerWidth / 2
const wallThickness=2;
const holeRadius = 5.5;
const tolerance= 0.3
const height=40
const innerSpace = 8.1


 const main = () => { 
//const shape = drawRoundedRectangle(20, 20).sketchOnPlane().extrude(2)
const shape = draw()
.hLine(innerWidth / 2 + wallThickness)
.vLine(2*wallThickness)
.bulgeArc(-wallThickness, -wallThickness, 0.5)
.hLine(-innerWidth / 2)
.closeWithMirror()
.sketchOnPlane("XZ").extrude(innerWidth).translateY(innerWidth / 2)

const holder = draw([0, -half])
.lineTo([height, 0])
.customCorner(6)
.lineTo([0, half])
.close()
.sketchOnPlane("ZY")
.extrude(innerSpace).translateX(innerSpace / 2).translateZ(wallThickness)

return shape.fuse(holder).cut(drawCircle(holeRadius / 2 + tolerance).sketchOnPlane().extrude(height / 2 - wallThickness))
 }; 