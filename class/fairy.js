
function Fairy(env) {

  var h = this;
  h.isFairy = true;

  h.make = function(def, cx, cy) {
    h.id      = def.id;
    h.color   = def.color;
    h.label   = def.label;
    h.radius  = def.radius;
    h.x       = cx; h.y = cy;
    h.cx      = cx; h.cy = cy;
    h.angle   = rand(0, Math.PI * 2);
    h.orbitR  = env.TILE * 2.5;
    h.speed   = 2.5 + rand(-0.5, 0.5);
    // Release burst: 10 seconds of kill-on-sight
    h.releaseBurst = 10.0;
    h.life    = 9999; // companion - permanent this floor
    // Companion orbit state
    h.homeAngle   = rand(0, Math.PI * 2);
    h.homeTimer   = rand(0, 5);
    h.figureT     = rand(0, Math.PI * 2); // for figure-8
    h.figureSpeed = 1.8 + rand(-0.4, 0.4);
    h.orbitDist   = (2 + rand(-0.3, 0.5)) * env.TILE; // 2-3 tiles
    h.releasePhase = true; // explosion phase first
    h.releaseTimer = 0;
    
    h.fairyAnim = new SpritePlayer(env.FAIRY_TPL.animObject.project,'idle',env.FAIRY_TPL.animObject.images);

    h.fairyAnim.force_show = ['head_' + h.id];
    h.fairyAnim.force_hide = ['head_a', 'head_b', 'head_c'];
    h.fairyAnim.force_hide.splice(h.fairyAnim.force_hide.indexOf(h.fairyAnim.force_show[0]), 1);
               
    return h;
  };

  h.update = function(dt) {
    if (!env.player) return false;

    h.figureT += h.figureSpeed * dt;
    h.fairyAnim.update(dt);

    // Drift home angle occasionally
    h.homeTimer -= dt;
    if (h.homeTimer <= 0) {
      h.homeAngle += rand(-0.8, 0.8);
      h.homeTimer = rand(3, 7);
    }

    // Release explosion phase (first 10 seconds)
    if (h.releasePhase) {
      h.releaseBurst -= dt;
      h.releaseTimer += dt;

      // Orbit expanding outward from cage center, then snap back
      h.angle  += h.speed * dt;
      h.orbitR += dt * 18;

      h.x = h.cx + Math.cos(h.angle) * h.orbitR;
      h.y = h.cy + Math.sin(h.angle) * h.orbitR;

      // Kill nearby monsters while burst active
      if (h.releaseBurst > 0) {
        for (var i = env.entities.length - 1; i >= 0; i--) {
          var e = env.entities[i];
          if (!e.isMonster || e.dead) continue;
          var ddist = Math.sqrt(Math.pow(e.x - h.x, 2) + Math.pow(e.y - h.y, 2));
          if (ddist < h.radius * env.TILE) {
            env.spawnDeath(e.x, e.y, e.def.color);
            env.addLog(e.origin.name + ' уничтожен феей!', 'fairy');
            e.dead = true;
          }
        }
        env.entities = env.entities.filter(function(e){ return !e.dead; });
      }

      if (h.releaseBurst <= 0) {
        h.releasePhase = false;
        // snap to companion position
        h.cx = env.player.x;
        h.cy = env.player.y;
      }

      // Particles during burst
      if (Math.random() < 0.3) {
       // env.spawnParticle(h.x, h.y, rand(-30,30), rand(-50,-5), 0.6, h.color, rand(2,6));
      }
      return true;
    }

    var px = env.player.x, py = env.player.y;

    // Figure-8 (Lissajous) relative to home angle around player
 
    // Rotate by homeAngle
    var ca = Math.cos(h.homeAngle), sa = Math.sin(h.homeAngle);
    var targetX = px + ca * h.orbitDist - sa * h.orbitDist;
    var targetY = py + sa * h.orbitDist + ca * h.orbitDist;

      targetX += Math.cos(h.figureT) * 8;
      targetY += Math.sin(h.figureT) * 8;

    // Smooth follow
    var lerpSpeed = 3.5 * dt;
    h.x += (targetX - h.x) * Math.min(1, lerpSpeed);
    h.y += (targetY - h.y) * Math.min(1, lerpSpeed);

    // Subtle particles
    if (Math.random() < 0.1) {
     // env.spawnParticle(h.x, h.y, rand(-15,15), rand(-25,0), 0.4, h.color, rand(1,3));
    }

    return true; // lives forever as companion this floor
  };

  h.draw = function(ctx) {
    // var a = h.releasePhase ? Math.min(1, h.releaseBurst * 0.3 + 0.4) : 0.85;
    // ctx.globalAlpha = a;
   
    h.fairyAnim.draw(ctx, h.x, h.y, 0.3);
    ctx.globalAlpha = 1;
  };
}
