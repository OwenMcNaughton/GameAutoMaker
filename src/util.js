function Centroid(sprites) {
  var c = {x: 0, y: 0};
  
  for (var i = 0; i != sprites.length; i++) {
    var s = sprites[i];
    c.x += s.pos.x + s.size/2;
    c.y += s.pos.y + s.size/2;
  }
  
  c.x /= sprites.length;
  c.y /= sprites.length;
  return c;
}

function GetRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 14) + 2];
    }
    return color;
}
  
function RectOverlap(r1, r2) {
  return !(r2.l > r1.r || r2.r < r1.l || r2.t > r1.b || r2.b < r1.t);
}

function GetRandomColors(cnt) {
  var colors = [];
  for (var i = 0; i != cnt; i++) {
    colors.push(GetRandomColor());
  }
  return colors;
}

function SpriteOverlap(s1, s2) {
  var r1 = {l: s1.pos.x - 1, r: s1.pos.x + s1.size + 1,
            t: s1.pos.y - 1, b: s1.pos.y + s1.size + 1};
  var r2 = {l: s2.pos.x - 1, r: s2.pos.x + s2.size + 1,
            t: s2.pos.y - 1, b: s2.pos.y + s2.size + 1};
  return RectOverlap(r1, r2);
}
              
function Dist(v1, v2){
  var xd = Math.abs(v1.x - v2.x);
  var yd = Math.abs(v2.y - v2.y);
  return xd*xd + yd*yd;
}