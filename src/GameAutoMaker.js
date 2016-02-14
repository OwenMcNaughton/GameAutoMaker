function GameAutoMaker(frames, pix_tol, move_tol) {
  this.frames = frames;
  this.pix_tol = pix_tol;
  this.move_tol = move_tol;
  this.sprite_groups = [];

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
          var tl = sg.trail.length;
          var vel_count = tl >= 5 ? 5 : tl;
          for (var i = 1; i < vel_count; i++) {
            sg.vel.x += sg.trail[tl-i].x - sg.trail[tl-i-1].x;
            sg.vel.y += sg.trail[tl-i].y - sg.trail[tl-i-1].y;
          }
          sg.vel.x /= vel_count; sg.vel.y /= vel_count;
          sg.vel.x = sg.vel.x.toFixed(2); sg.vel.y = sg.vel.y.toFixed(2);
          
          if (dist > .1) {
            sg.trail.push(osg.c);
          }
        } else {

        }
      }
    }

    for (var i = 0; i < sprite_groups.length; i++) {
      if (sprite_groups[i].color == undefined) {
        sprite_groups[i].color = GetFreeColor(this.colors);
      }
    }

    this.sprite_groups = sprite_groups;
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
      vel: {x: 0, y: 0}
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
        ctx.fillText("" + sg.vel.x + " " + sg.vel.y, tl.x, tl.y-2);
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