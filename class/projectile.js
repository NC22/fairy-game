function Projectile(env) {

  var h = this;
  h.isProjectile = true;

  // vx/vy are pixel/s - supports any angle (diagonal included)
  h.make = function(fx, fy, vx, vy, atk, bounces) {
    h.x = fx; h.y = fy;
    h.vx = vx; h.vy = vy;
    h.atk = atk;
    h.bounces = (bounces !== undefined) ? bounces : 10;
    h.life = 2.2;
    h.trail = [];
    h.angle = Math.atan2(vy, vx);
    h.dangerTimeout = 0.1;
    h.type = 'arrow';
    return h;
  };

  // Legacy helper for dc/dr integer direction
  h.makeDir = function(fx, fy, dc, dr, atk) {
    var speed = env.TILE * 9;
    return h.make(fx, fy, dc * speed, dr * speed, atk, 10);
  };

  function wallAt(wx, wy) {
    var tc = Math.floor(wx / env.TILE);
    var tr = Math.floor(wy / env.TILE);
    return env.isWall(tc, tr);
  }

    h.simulateHitsPlayer = function(fx, fy, angle, maxBounces) {
        var SIM_STEP     = 2;          // px за шаг симуляции
        var SIM_MAX_ITER = 600;        // макс шагов симуляции
        var px = fx, py = fy;
        var vx = Math.cos(angle) * SIM_STEP;
        var vy = Math.sin(angle) * SIM_STEP;
        var bounces = 0;
        var path = [{x:px, y:py}];

        var player = env.player;
        var pr = env.TILE * 0.55;

        for (var i = 0; i < SIM_MAX_ITER; i++) {
            var nx = px + vx;
            var ny = py + vy;

            // Проверка попадания в игрока
            if (Math.abs(nx - player.x) < pr && Math.abs(ny - player.y) < pr) {
                path.push({x:nx, y:ny});
                return path; // успех
            }

            var hitX = env.isWall(Math.floor(nx / env.TILE), Math.floor(py / env.TILE));
            var hitY = env.isWall(Math.floor(px / env.TILE), Math.floor(ny / env.TILE));

            if (hitX || hitY) {
                if (bounces >= maxBounces) return null;
                bounces++;
                if (hitX) vx = -vx;
                if (hitY) vy = -vy;
                path.push({x:px, y:py}); // точка рикошета
                nx = px + vx;
                ny = py + vy;
            }

            px = nx;
            py = ny;

            if (i % 40 === 0) path.push({x:px, y:py});
        }
        return null;
    };

  h.update = function(dt) {
      
    h.trail.push({x: h.x, y: h.y});
    if (h.trail.length > 40) h.trail.shift();

    h.life -= dt;
    if (h.life <= 0) return false;

    // Sub-step movement for reliable wall detection
    var steps = 3;
    var sdx = h.vx * dt / steps;
    var sdy = h.vy * dt / steps;
    
    h.dangerTimeout-=dt;
    
    for (var s = 0; s < steps; s++) {
      var nx = h.x + sdx;
      var ny = h.y + sdy;

    
      if (h.dangerTimeout <= 0) {
          var hitX = wallAt(nx, h.y);
          var hitY = wallAt(h.x, ny);

          if (hitX || hitY) {
            if (h.bounces <= 0) {
              // Impact particles
              for (var pi = 0; pi < 6; pi++) {
                var a = h.angle + Math.PI + rand(-0.7, 0.7);
                env.spawnParticle(h.x, h.y, Math.cos(a)*rand(25,70), Math.sin(a)*rand(25,70), 0.3, '#c8a040', rand(2,4));
              }
              return false;
            }
            h.bounces--;
            // Reflect
            if (hitX) { h.vx = -h.vx; sdx = -sdx; }
            if (hitY) { h.vy = -h.vy; sdy = -sdy; }
            h.angle = Math.atan2(h.vy, h.vx);
            // Ricochet spark
            for (var pi2 = 0; pi2 < 4; pi2++) {
              var a2 = h.angle + rand(-0.5, 0.5);
              env.spawnParticle(h.x, h.y, Math.cos(a2)*rand(20,55), Math.sin(a2)*rand(20,55), 0.22, '#ffee88', rand(1,3));
            }
            nx = h.x + sdx;
            ny = h.y + sdy;
          }
      }
      
      h.x = nx;
      h.y = ny;
    }

    h.angle = Math.atan2(h.vy, h.vx);

    // Friendly fire
    if (h.dangerTimeout <= 0) 
    if (env.player && env.player.hp > 0) {
      var pl = env.player;
      if (Math.abs(h.x - pl.x) < env.TILE * 0.38 && Math.abs(h.y - pl.y) < env.TILE * 0.38) {
        var selfDmg = Math.max(1, Math.floor(h.atk * 0.5));
        pl.hp -= selfDmg;
        pl.hitFlash = 0.3;
        env.spawnHit(h.x, h.y, 0, 0, '#5588ff');
        env.spawnDmgNum(h.x, h.y - 16, selfDmg, '#88aaff');
        if (pl.hp <= 0) pl.kill();
        return false;
      }
    }

    // Monster hits
    if (h.type != 'slime') {
    for (var j = 0; j < env.entities.length; j++) {
      var e = env.entities[j];

      // Destructable item hit
      //if (e.isItem && e.isDestructable && !e.picked) {
      //    var ec = Math.floor(e.x / env.TILE), er = Math.floor(e.y / env.TILE);
      //    if (Math.abs(h.x - e.x) < env.TILE * 0.5 && Math.abs(h.y - e.y) < env.TILE * 0.5) {
      //        e.takeHit(h.atk, h.angle);
      //        return false;
      //    }
      //}

      if (!e.isMonster || e.dead) continue;
      var ex = e.c * env.TILE + env.TILE/2, ey = e.r * env.TILE + env.TILE/2;
      if (Math.abs(h.x - ex) < env.TILE * 0.5 && Math.abs(h.y - ey) < env.TILE * 0.5) {
        var dmg = Math.max(1, h.atk - (e.def||0) + randi(-1,1));
        e.hp -= dmg; e.hitFlash = 0.28;
        var dca = Math.cos(h.angle), dra = Math.sin(h.angle);
        e.nudge = {x: dca*10, y: dra*10, t: 0.15};
        env.spawnHit(h.x, h.y, dca, dra, e.def.color);
        env.spawnDmgNum(h.x, h.y - 16, dmg, '#ffdd44');
        if (e.hp <= 0) e.kill();
        return false;
      }
    }
    }
    return true;
  };

  function drawTrail(ctx) {
      
        for (var t = 0; t < h.trail.length; t++) {
          var tf = t / h.trail.length;
          ctx.globalAlpha = tf * 0.3;
          ctx.fillStyle = 'rgba(120,220,255,0.9)';
          var ts = 1.5 + tf * 2.5;
          ctx.fillRect(h.trail[t].x - ts/2, h.trail[t].y - ts/2, ts, ts);
        }
      
  }
        
  h.draw = function(ctx) {
      
    if (h.type == 'magic') {
       
      var len = Math.sqrt(h.vx*h.vx + h.vy*h.vy);
      var dx = h.vx / len;
      var dy = h.vy / len;

      var nx = -dy;
      var ny = dx;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      var tailLength = 32;
      var width = 6;

      var tx = h.x - dx * tailLength;
      var ty = h.y - dy * tailLength;

      // главная полоса
      var grad = ctx.createLinearGradient(h.x, h.y, tx, ty);
      grad.addColorStop(0, "rgba(80,190,255,1)");
      grad.addColorStop(0.4, "rgba(40,150,220,0.9)");
      grad.addColorStop(1, "rgba(20,80,160,0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = width;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // внутренний яркий стержень
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(120,220,255,0.9)";
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // ядро
      var pulse = 1 + Math.sin(h.life * 10) * 0.12;
      var r = 5 * pulse;

      var core = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, r);
      core.addColorStop(0, "rgba(140,240,255,1)");
      core.addColorStop(0.5, "rgba(60,170,240,0.9)");
      core.addColorStop(1, "rgba(20,80,160,0)");

      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(h.x, h.y, r, 0, Math.PI*2);
      ctx.fill();

      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
   
      drawTrail(ctx);
      
    } else if (h.type == 'arrow') {
      
        drawTrail(ctx);
        
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.angle);

        drawSpr(ctx,'arrow', 0, 0, 0);

        ctx.restore();
        
    } else if (h.type == 'slime') {
        
         // Трейл
        for (var t = 0; t < h.trail.length; t++) {
            var tf = t / h.trail.length;
            ctx.globalAlpha = tf * 0.4;
            ctx.fillStyle = '#22dd22';
            var ts = 2 + tf * 3;
            ctx.beginPath();
            ctx.arc(h.trail[t].x, h.trail[t].y, ts, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Снаряд — зелёный шарик
        ctx.save();
        ctx.translate(h.x, h.y);
        var pulse = 0.85 + 0.15 * Math.sin(Date.now() * 0.012);
        var r = env.TILE * 0.08 * pulse;
        var grd = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grd.addColorStop(0, '#aaffaa');
        grd.addColorStop(1, '#116611');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
    
    
        ctx.globalAlpha = 1;
  };
}
