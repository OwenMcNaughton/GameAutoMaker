function GameAutoMaker(footage, pix_tol, move_tol) {
  this.footage = footage;
  this.pix_tol = pix_tol;
  this.move_tol = move_tol;
  this.sprite_groups = [];
  
  this.colors = GetRandomColors(100);
}

GameAutoMaker.prototype = {
  ProcessFrame: function(idx) {
    var sprite_groups = [];
    var frame = this.footage[idx];
    
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
        
        var sg = {s: [sprites[i].s], c: Centroid([sprites[i].s])};
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
    
    /*
    for (var i = 0; i < sprite_groups.length; i++) {
      for (var j = 0; j < this.sprite_groups.length; j++) {
        if (Dist(sprite_groups[i].c, this.sprite_groups[j].c) < this.move_tol) {
          this.sprite_groups.splice(j, 1, sprite_groups[i]);
        } else {
          this.sprite_groups.push(sprite_groups[i]);
        }
      }
    }
    */
    
    this.sprite_groups = sprite_groups;
  },
};