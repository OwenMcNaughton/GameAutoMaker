var button_map = new Map();
button_map.set(0, "KEY_A");
button_map.set(1, "KEY_B");
button_map.set(2, "KEY_SELECT");
button_map.set(3, "KEY_START");
button_map.set(4, "KEY_UP");
button_map.set(5, "KEY_DOWN");
button_map.set(6, "KEY_LEFT");
button_map.set(7, "KEY_RIGHT");


function GameAutoMaker(frames, pix_tol, move_tol) {
  this.frames = frames;
  this.pix_tol = pix_tol;
  this.move_tol = move_tol;
  this.sprite_groups = [];
  this.inputs = [];
  this.input;

  this.last_frame = 0;

  this.colors = GetRandomColors(100);
}

GameAutoMaker.prototype = {
  ResetFrames: function(frames) {
    this.frames = frames;
  },

  ProcessFrame: function(idx) {
    var sprite_groups = [];
    var old_sprite_groups = this.sprite_groups;
    var frame = this.frames[idx];
    if (frame == undefined) return;
    
    this.input = frame.input;
    this.inputs.push(frame.input);

    for (var key of this.colors.keys()) {
      this.colors[key] = true;
    }

    var sprites = [];
    for (var i = 0; i < frame.sprites.length; i++) {
      sprites.push({s: frame.sprites[i], b: true});
    }

    for (var sprite of sprites) {
      if (sprite.b) {
        sprite.b = false;

        if (this.MergeSpriteWithGroup(sprite, sprite_groups)) continue;

        var sg = this.CreateSpriteGroup(sprite, sprites);

        sprite_groups.push(sg);
      }
    }

    for (var sg of sprite_groups) {
      sg.vel = {x: 0, y: 0};
      for (var osg of old_sprite_groups) {
        var dist = Dist(sg.c, osg.c);
        if (dist < this.move_tol) {
          sg.color = osg.color;
          this.colors[sg.color] = false;
          sg.trail = osg.trail;
          sg.age = osg.age + 1;
          sg.hit = osg.hit;
          sg.velhist = osg.velhist;
          sg.still_cnt = osg.still_cnt;
          sg.button_correlates = osg.button_correlates;
          var tl = sg.trail.length;
          var vel_count = tl >= 5 ? 5 : tl;
          for (var i = 1; i < vel_count; i++) {
            sg.vel.x += sg.trail[tl-i].x - sg.trail[tl-i-1].x;
            sg.vel.y += sg.trail[tl-i].y - sg.trail[tl-i-1].y;
          }
          sg.vel.x /= vel_count; sg.vel.y /= vel_count;
          
          if (dist > .1) {
            sg.trail.push(osg.c);
            sg.still_cnt = 0;
          } else {
            sg.still_cnt++;
            if (sg.still_cnt > 3) {
              sg.vel = {x: 0, y: 0};
            }
          }
          
          sg.velhist.push(sg.vel);
        }
      }
    }

    for (var i = 0; i < sprite_groups.length; i++) {
      if (sprite_groups[i].color == undefined) {
        sprite_groups[i].color = GetFreeColor(this.colors);
      }
    }

    this.sprite_groups = sprite_groups;
    
    this.CorrelateInput(idx);
    if (idx % 20 == 0) {
      var str = "frame: " + idx + "\n";
      for (var sg of this.sprite_groups) {
        str += "\tSPR: " + sg.color + "\n" + this.ButtonCorrelatesToString(sg);
      }
      console.log(str);
    }
    
    this.last_frame = idx;
  },

  // Check if sprite intersects any existing group - if so, merge with it.
  MergeSpriteWithGroup: function(sprite, sprite_groups) {
    var done = false;
    for (var j = 0; j < sprite_groups.length; j++) {
      for (var k = 0; k < sprite_groups[j].s.length; k++) {
        if (SpriteOverlap(sprite.s, sprite_groups[j].s[k])) {
          sprite_groups[j].s.push(sprite.s);
          sprite_groups[j].c = Centroid(sprite_groups[j].s);
          done = true;
          break;
        }
      }
      if (done) break;
    }
    return done;
  },

  // Check if lone sprite intersects any other lone sprites, merge and return.
  CreateSpriteGroup: function(sprite, others) {
    var sg = {
      s: [sprite.s], c: Centroid([sprite.s]), trail: [], age: 0, hit: false,
      vel: {x: 0, y: 0}, velhist: [], button_correlates: [], still_cnt: 0
    };
    for (var other of others) {
      if (sprite != other && other.b) {
        if (SpriteOverlap(sprite.s, other.s)) {
          other.b = false;
          sg.s.push(other.s);
          sg.c = Centroid(sg.s);
        }
      }
    }
    return sg;
  },

  CorrelateInput: function(idx) {
    if (this.inputs[idx] == undefined) return;
    
    for (var sg of this.sprite_groups) {
      if (sg.age > 10) {
        var vh = sg.velhist;
        var vel_diff = {
          x: vh[vh.length-1].x - vh[vh.length-2].x,
          y: vh[vh.length-1].y - vh[vh.length-2].y
        };
        
        if (sg.color == "#009933") {
          var a = 2;
        }
        
        //if (vel_diff.x != 0 && vel_diff.y != 0) {
          for (var i = 0; i != this.inputs[idx].length; i++) {
            if (this.input[i] == 1) {
              if (sg.button_correlates[i] == undefined) {
                sg.button_correlates[i] = [];
              }
              sg.button_correlates[i].push(vh[vh.length-1]);
            }
          }
        //}
      }
    }
  },
  
  ButtonCorrelatesToString: function(sg) {
    var str = "";
    var cnt = -1;
    for (var bc of sg.button_correlates) {
      cnt++;
      if (bc == undefined) continue;
      var avg_vel_diff = {x: 0, y: 0};
      for (var i = 0; i != bc.length; i++) {
        if (!isNaN(bc[i].x && !isNaN(bc[i].y))) {
          avg_vel_diff.x += bc[i].x;
          avg_vel_diff.y += bc[i].y;
        }
      }
      avg_vel_diff.x /= bc.length;
      avg_vel_diff.y /= bc.length;
      if (isNaN(avg_vel_diff.x) || isNaN(avg_vel_diff.y)) continue;
      str += "\t\t" + button_map.get(cnt) + ": " + avg_vel_diff.x + " " + avg_vel_diff.y + "\n";
    }
    return str;
  },
  
  Draw: function(ctx) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px Arial";
    ctx.fillText("" + this.sprite_groups.length, 2, 10);
    
    for (var sg of this.sprite_groups) {
      ctx.strokeStyle = sg.color;
      ctx.lineWidth = 2;

      var tl = {x: 1000, y: 1000};
      for (var s of sg.s) {
        if (s.pos.x < tl.x) tl.x = s.pos.x;
        if (s.pos.y < tl.y) tl.y = s.pos.y;

        ctx.beginPath();
        ctx.rect(s.pos.x, s.pos.y, s.size, s.size);
        ctx.stroke();
      }

      if (sg.hit) {
        ctx.fillText("" + sg.age, tl.x, tl.y-12);
        ctx.fillText("" + sg.vel.x.toFixed(2) + " " + 
                     sg.vel.y.toFixed(2), tl.x, tl.y-2);
      }

      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.arc(sg.c.x, sg.c.y, 1, 0, 2*Math.PI);
      ctx.stroke();
      
      ctx.strokeStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.moveTo(sg.c.x, sg.c.y);
      ctx.lineTo(sg.c.x + sg.vel.x*20, sg.c.y + sg.vel.y*20);
      ctx.stroke();
    }

    for (var sg of this.sprite_groups) {
      ctx.strokeStyle = sg.color;
      ctx.lineWidth = 2;
      var rgb = HexToRgb(sg.color);
      for (var j = 1; j < sg.trail.length; j++) {
        ctx.strokeStyle = "rgb("+rgb.r+","+rgb.g+","+rgb.b+")";
        ctx.beginPath();
        ctx.moveTo(sg.trail[j-1].x, sg.trail[j-1].y);
        ctx.lineTo(sg.trail[j].x, sg.trail[j].y);
        ctx.stroke();
      }
    }
    
    if (this.input != undefined) {
      DrawNesController(ctx, this.input);
    }
    
  },
  
  MouseMove: function(mouse) {
    var mouse_rect = {l: mouse.x, r: mouse.x, t: mouse.y, b: mouse.y};
    for (var group of this.sprite_groups) {
      for (var s of group.s) {
        var s_rect = {
          l: s.pos.x, r: s.pos.x + s.size, t: s.pos.y, b: s.pos.y + s.size
        };
        if (RectOverlap(mouse_rect, s_rect)) {
          group.hit = true;
          return;
        }
      }
    }
  }
};