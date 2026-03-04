function CameraController(env) {
  var h = this;

  h.make = function(x, y) {
    h.x = x || 0;
    h.y = y || 0;
    h.target = {x : 0, y : 0};
    return h;
  };

  h.setPos = function(x, y) {
    h.x = x;
    h.y = y;
  };

  h.panTo = function(factor) {
    var t = (typeof factor === 'number') ? factor : 0.09;
    h.x += (h.target.x - h.x) * t;
    h.y += (h.target.y - h.y) * t;
  };

  h.drawPosCell = function(ctx){
    var pos = env.camera.getCell();
    var x = pos.c * env.TILE;
    var y = pos.r * env.TILE;
    ctx.save();
    ctx.strokeStyle = 'rgba(110, 255, 190, 0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, env.TILE - 4, env.TILE - 4);
    ctx.fillStyle = 'rgba(110, 255, 190, 0.12)';
    ctx.fillRect(x + 2, y + 2, env.TILE - 4, env.TILE - 4);
    ctx.font = '7px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#a8ffd8';
    ctx.fillText(pos.c + ':' + pos.r, x + env.TILE / 2, y - 4);
    ctx.restore();
  }
  
  h.moveCell = function(dc, dr) {
    var minC = 0, minR = 0;
    var maxC = env.cfg.mapW - 1, maxR = env.cfg.mapH - 1;
    var cc = Math.round((h.x - env.TILE / 2) / env.TILE);
    var rr = Math.round((h.y - env.TILE / 2) / env.TILE);
    cc = Math.max(minC, Math.min(maxC, cc + dc));
    rr = Math.max(minR, Math.min(maxR, rr + dr));

    h.target.x = cc * env.TILE + env.TILE / 2;
    h.target.y = rr * env.TILE + env.TILE / 2;
    
    // h.setPos(h.target.x, h.target.y); // instant
    return { c: cc, r: rr };
  };

  h.getCell = function() {
    return {
      c: Math.max(0, Math.min(env.cfg.mapW - 1, Math.round((h.x - env.TILE / 2) / env.TILE))),
      r: Math.max(0, Math.min(env.cfg.mapH - 1, Math.round((h.y - env.TILE / 2) / env.TILE)))
    };
  };
}
