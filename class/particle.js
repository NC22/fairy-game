
// ============================================================
//  PARTICLE CLASS
// ============================================================
function Particle(env) {

  var h = this;

  h.make = function(x, y, vx, vy, life, color, size, type) {
    h.x = x; h.y = y;
    h.vx = vx; h.vy = vy;
    h.life = life; h.maxLife = life;
    h.color = color; h.size = size;
    h.type = type || 'sp';
    return h;
  };

  h.update = function(dt) {
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.vy += 80 * dt;
    h.life -= dt;
    return h.life > 0;
  };

  h.draw = function(ctx) {
    var t = h.life / h.maxLife;
    ctx.globalAlpha = Math.max(0, t);
    if (h.type === 'sp') {
      ctx.fillStyle = h.color;
      var s = h.size * t;
      ctx.fillRect(h.x - s/2, h.y - s/2, s, s);
    } else if (h.type === 'cx') {
      var s = h.size * (1 + 0.5 * (1 - t));
      ctx.strokeStyle = h.color; ctx.lineWidth = 2 * t;
      ctx.beginPath();
      ctx.moveTo(h.x-s, h.y); ctx.lineTo(h.x+s, h.y);
      ctx.moveTo(h.x, h.y-s); ctx.lineTo(h.x, h.y+s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
}