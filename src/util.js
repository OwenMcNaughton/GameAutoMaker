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
  
  colors = ["#006699", "#cc0000", "#ffff00", "#009933", "#00ffff", "#cc00cc",
            "#99ff99", "#33ccff", "#cc9900", "#ff6666", "#ccff66", "#ffcccc",
            "#666699", "#003300", "#660066", "#cc99ff", "#339966", "#993366",
            "#666633", "#ffcccc", "#ccccff", "#ccffff", "#ffffff", "#ff6699"];
  
  for (var i = 0; i < cnt - 24; i++) {
    colors.push(GetRandomColor());
  }
  
  var r = new Map();
  for (var c of colors) {
    r.set(c, true);
  }
  
  return r;
}

function GetFreeColor(colors) {
  for (var key of colors.keys()) {
    if (colors[key]) {
      colors[key] = false;
      return key;
    }
  }
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
  var yd = Math.abs(v1.y - v2.y);
  return xd*xd + yd*yd;
}

function HexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

var x = 0, y = 0;
function DrawNesController(ctx, input) {
  ctx.strokeStyle = "#222222";
  ctx.fillStyle = "#333333";
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.rect(260, 100, 15, 15); // left
  ctx.rect(275, 85, 15, 15);  // up
  ctx.rect(275, 115, 15, 15); // down
  ctx.rect(290, 100, 15, 15); // right
  ctx.rect(320, 100, 15, 15); // select
  ctx.rect(340, 100, 15, 15);  // start
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = "#CC3333"
  ctx.rect(370, 100, 15, 15); // a
  ctx.rect(390, 100, 15, 15); // b
  ctx.stroke();
  
  if (input[6] == 1) ctx.fillRect(260, 100, 15, 15);
  if (input[4] == 1) ctx.fillRect(275, 85, 15, 15);
  if (input[5] == 1) ctx.fillRect(275, 115, 15, 15);
  if (input[7] == 1) ctx.fillRect(290, 100, 15, 15);
  if (input[2] == 1) ctx.fillRect(320, 100, 15, 15);
  if (input[3] == 1) ctx.fillRect(340, 100, 15, 15);
  
  ctx.fillStyle = "#cc3333";
  if (input[0] == 1) ctx.fillRect(370, 100, 15, 15); // a
  if (input[1] == 1) ctx.fillRect(390, 100, 15, 15); // b
}