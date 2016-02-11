function GameAutoMaker(frames, pix_tol, move_tol) {
  this.frames = frames;
  this.pix_tol = pix_tol;
  this.move_tol = move_tol;
  this.sprite_groups = [];
  
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
    
    var sprites = [];
    for (var i = 0; i < frame.sprites.length; i++) {
      sprites.push({s: frame.sprites[i], b: true});
    }
    
    for (var i = 0; i < sprites.length; i++) {
      if (sprites[i].b) {
        sprites[i].b = false;
        
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
        if (done) continue;
        
        var sg = {s: [sprites[i].s], c: Centroid([sprites[i].s]), trail: []};
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
      }
    }
    
    for (var i = 0; i < sprite_groups.length; i++) {
      sprite_groups[i].color = this.colors[i];
    }
    
    for (var i = 0; i < sprite_groups.length; i++) {
      var sg = sprite_groups[i];
      for (var j = 0; j < old_sprite_groups.length; j++) {
        if (Dist(sg.c, old_sprite_groups[j].c) < this.move_tol) {
          sg.color = old_sprite_groups[j].color;
          sg.trail = old_sprite_groups[j].trail;
          sg.trail.push(old_sprite_groups[j].c);
        } else {
          
        }
      }
    }
    
    this.sprite_groups = sprite_groups;
  },
  
  Draw: function(ctx) {
    for (var i = 0; i < this.sprite_groups.length; i++) {
      ctx.fillStyle = this.sprite_groups[i].color;
      for (var j = 0; j < this.sprite_groups[i].s.length; j++) {
        ctx.fillRect(this.sprite_groups[i].s[j].pos.x,
                     this.sprite_groups[i].s[j].pos.y,
                     this.sprite_groups[i].s[j].size,
                     this.sprite_groups[i].s[j].size);
      }
    }
    
    for (var i = 0; i < this.sprite_groups.length; i++) {
      var sg = this.sprite_groups[i];
      ctx.strokeStyle = sg.color;
      ctx.lineWidth = 3;
      for (var j = 1; j < sg.trail.length; j++) {
        ctx.beginPath();
        ctx.moveTo(sg.trail[j-1].x, sg.trail[j-1].y);
        ctx.lineTo(sg.trail[j].x, sg.trail[j].y);
        ctx.stroke();
      }
    }
    
  }
};