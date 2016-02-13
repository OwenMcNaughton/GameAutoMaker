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
    
    for (var key of this.colors.keys()) {
      this.colors[key] = true;
    }
    
    if (frame == undefined) return;
    
    var sprites = [];
    for (var i = 0; i < frame.sprites.length; i++) {
      sprites.push({s: frame.sprites[i], b: true});
    }
    
    for (var i = 0; i < sprites.length; i++) {
      if (sprites[i].b) {
        sprites[i].b = false;
        
        if (this.MergeSpriteWithGroup(i, sprites, sprite_groups)) continue;
        
        this.CreateSpriteGroup(i, sprites, sprite_groups);
      }
    }

    for (var sg of sprite_groups) {
      for (var osg of old_sprite_groups) {
        var dist = Dist(sg.c, osg.c);
        if (dist < this.move_tol) {
          sg.color = osg.color;
          this.colors[sg.color] = false;
          sg.trail = osg.trail;
          sg.age = osg.age + 1;
          if (dist > 1) {
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
  
  MergeSpriteWithGroup: function(i, sprites, sprite_groups) {
    var done = false;
    for (var j = 0; j < sprite_groups.length; j++) {
      for (var k = 0; k < sprite_groups[j].s.length; k++) {
        if (SpriteOverlap(sprites[i].s, sprite_groups[j].s[k])) {
          sprite_groups[j].s.push(sprites[i].s);
          sprite_groups[j].c = Centroid(sprite_groups[j].s);
          done = true;
          break;
        }
      }
      if (done) break;
    }
    return done;
  },
  
  CreateSpriteGroup: function(i, sprites, sprite_groups) {
    var sg = {
      s: [sprites[i].s], c: Centroid([sprites[i].s]), trail: [], age: 0
    };
    for (var j = 0; j < sprites.length; j++) {
      if (i != j && sprites[j].b) {
        if (SpriteOverlap(sprites[i].s, sprites[j].s)) {
          sprites[j].b = false;
          sg.s.push(sprites[j].s);
          sg.c = Centroid(sg.s);
        }
      }
    }
    sprite_groups.push(sg);
  },
  
  Draw: function(ctx) {
    ctx.fillStyle = "#FFFFFF";
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
      
      ctx.font = "10px Arial";
      ctx.fillText("" + sg.age, tl.x, tl.y-2);
      
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.arc(sg.c.x, sg.c.y, 1, 0, 2*Math.PI);
      ctx.stroke();
    }
    
    for (var sg of this.sprite_groups) {
      ctx.strokeStyle = sg.color;
      ctx.lineWidth = 2;
      var rgb = HexToRgb(sg.color);
      var a = 1.0;
      for (var j = 1; j < sg.trail.length && a > 0; j++) {
        ctx.strokeStyle = "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+a+")";
        // a -= .005;
        ctx.beginPath();
        ctx.moveTo(sg.trail[j-1].x, sg.trail[j-1].y);
        ctx.lineTo(sg.trail[j].x, sg.trail[j].y);
        ctx.stroke();
      }
    }
  }
};