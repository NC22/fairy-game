
function DmgNum(env) {

  var h = this;

  h.make = function(x, y, dmg, color) {
    h.x = x; h.y = y; h.vy = -52;
    h.dmg = String(dmg);
    h.color = color || '#ff4444';
    h.life = 0.7; h.maxLife = 0.7;
    return h;
  };

  h.update = function(dt) {
    h.y += h.vy * dt;
    h.life -= dt;
    return h.life > 0;
  };

  h.draw = function(ctx) {
    var a = Math.max(0, h.life / h.maxLife);
    ctx.globalAlpha = a;
    ctx.font = 'bold 12px Courier New'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 3;
    ctx.strokeText(h.dmg, h.x, h.y);
    ctx.fillStyle = h.color;
    ctx.fillText(h.dmg, h.x, h.y);
    ctx.globalAlpha = 1;
  };
}