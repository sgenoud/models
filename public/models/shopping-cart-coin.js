 const { drawRoundedRectangle, draw, drawCircle } = replicad; 
  
const coin_dia = 27.40;
const coin_hight = 2.15;


 const main = () => { 
   const coin = drawCircle(coin_dia / 2).fuse(drawRoundedRectangle(15, 30).translate(0, -15))
   const hole = draw().line(-3, 14).hLine(6).close().sketchOnPlane().extrude(coin_hight).fillet(1.5, e => e.inDirection("Z")).translateY(-32)
   return coin.sketchOnPlane().extrude(coin_hight).fillet(5, e => e.inDirection("Z")).cut(hole)
 }; 