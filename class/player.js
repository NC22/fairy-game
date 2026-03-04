// ============================================================
//  PLAYER CLASS
// ============================================================
function Player(env) {

    var h = this;
    h.isPlayer = true;

    h.make = function(c, r) {
        h.x = c * env.TILE + env.TILE / 2;
        h.y = r * env.TILE + env.TILE / 2;
        h.c = c;
        h.r = r;
        h.hp = 10;
        h.maxHp = 10;
        h.atk = 3;
        h.def = 1;
        h.xp = 0;
        h.xpNext = 10;
        h.level = 1;
        h.gold = 0;
        h.hopTimer = 0;
        h.hopSpeed = 5;
        h.hitFlash = 0;
        h.nudge = { x: 0, y: 0, t: 0 };
        h.lastDc = 1;
        h.lastDr = 0;
        h.facing = -1;
        h.moveHop = 0;
        h.weapon = 'sword';
        h.weapons = ['staff', 'sword', 'bow'];
        h.arrows = 20;
        h.mana = 60;
        h.maxMana = 60;
        h.manaRegenDelay = 0;
        h.stamina = 100;
        h.maxStamina = 100;
        h.staminaRegenDelay = 0;
        h.attackCooldown = 0;
        h.statPoints = 0;
        h.items = [];
        h.fairyKeys = {}; // {}; // {a : true, b : true, c : true};


        // Ranged aiming mode state (bow/staff)
        h.bowAiming = false;
        h.aimAngle = 0; // radians

        // Weapon swing overlay state
        h.swingActive = false;
        h.swingTimer = 0;
        h.swingDuration = 0.18;
        h.swingDc = 1; h.swingDr = 0;

        // Bow shoot animation state
        h.bowShooting = false;
        h.bowShootTimer = 0;

        return h;
    };

    // ---- Weapon part lists for force_hide/force_show ----
    var WEAPON_PARTS = {
        sword:  ['sword'],
        bow:    ['bow', 'bow_st', 'arrow'],
        staff:  ['magic_stick']
    };
    var ALL_WEAPON_PARTS = ['sword', 'bow', 'bow_st', 'arrow', 'magic_stick'];

    function applyWeaponVisibility() {
        var ac = env.PLAYER_TPL.animController;
        if (!ac) return;
        var weapon = h.weapon;
        var visibleParts = WEAPON_PARTS[weapon] || [];
        var hiddenParts = ALL_WEAPON_PARTS.filter(function(p) {
            return visibleParts.indexOf(p) === -1;
        });
        ac.force_hide = hiddenParts.slice();
        ac.force_show = visibleParts;

        // Extra: when idle with bow, hide right_arm (it holds sword)
        if (weapon === 'bow') {
            var animName = ac.getAnim ? ac.getAnim() : '';
            if (animName === 'idle') {
                if (ac.force_hide.indexOf('right_arm') === -1) ac.force_hide.push('right_arm');
            }
        }
    }

    h.update = function(dt) {
        var ac = env.PLAYER_TPL.animController;
        if (ac) {
            ac.update(dt);
            applyWeaponVisibility();
        }
        if (env.PLAYER_TPL.animBowController) env.PLAYER_TPL.animBowController.update(dt);

        if (h.nudge.t > 0) {
            h.nudge.t -= dt;
            if (h.nudge.t < 0) { h.nudge.x = 0; h.nudge.y = 0; }
        }

        var ptx = h.c * env.TILE + env.TILE / 2 + h.nudge.x;
        var pty = h.r * env.TILE + env.TILE / 2 + h.nudge.y;
        h.x += (ptx - h.x) * 0.3;
        h.y += (pty - h.y) * 0.3;

        h.hopTimer += dt * h.hopSpeed;
        if (h.moveHop > 0) h.moveHop = Math.max(0, h.moveHop - dt * 5.8);
        if (h.hitFlash > 0) h.hitFlash -= dt;
        if (h.attackCooldown > 0) h.attackCooldown = Math.max(0, h.attackCooldown - dt);
        if (h.staminaRegenDelay > 0) h.staminaRegenDelay = Math.max(0, h.staminaRegenDelay - dt);
        else if (h.stamina < h.maxStamina) h.stamina = Math.min(h.maxStamina, h.stamina + 32 * dt);
        if (h.manaRegenDelay > 0) h.manaRegenDelay = Math.max(0, h.manaRegenDelay - dt);
        else if (h.mana < h.maxMana) h.mana = Math.min(h.maxMana, h.mana + 8 * dt);

        if (h.swingActive) {
            h.swingTimer -= dt;
            if (h.swingTimer <= 0) h.swingActive = false;
        }
        if (h.bowShooting) {
            h.bowShootTimer -= dt;
            if (h.bowShootTimer <= 0) h.bowShooting = false;
        }
    };


  h.equipWeapon = function(weapon) {
    
    h.bowAiming = false;
    
    if (!weapon) return false;
    if (!(h.weapons||[]).includes(weapon)) {
      env.addLog('Оружие недоступно', 'info');
      return false;
    }
    h.weapon = weapon;
    env.addLog('Экипировано: ' + ({sword:'Меч',bow:'Лук',staff:'Посох'})[weapon], 'pick');
    return true;
  }

  h.usePotion = function() {
      
    var pi = h.items.findIndex(function(i){ return i.kind==='potion'; });
    
    if (pi < 0) { env.addLog('Нет зелья', 'info'); return false; }
    
    if (h.hp >= h.maxHp) { env.addLog('HP уже полное', 'info'); return false; }
    
    var h2 = 6 + h.level;
    h.hp = Math.min(h.maxHp, h.hp + h2);
    h.items.splice(pi, 1);
    env.addLog('+' + h2 + ' HP', 'pick');
    return true;
  }
  
    h.draw = function(ctx) {
        var sz = env.TILE * 0.82, half = sz / 2;
        
        var hopT = Math.max(0, Math.min(1, 1 - h.moveHop));
        
        var hy = Math.sin(hopT * Math.PI) * env.TILE * 0.16;
        var px = h.x, py = h.y - hy;

        // ---- Ranged aiming indicator (draw before player) ----
        if (h.bowAiming) {
            drawAimIndicator(ctx, px, py);
        }

        ctx.save();
        ctx.translate(px, py);

        var al = 1;
        if (h.hitFlash > 0) al = 0.35 + 0.65 * Math.abs(Math.sin(h.hitFlash * 38));
        ctx.globalAlpha = al;

        var ac = env.PLAYER_TPL.animController;
        var abc = env.PLAYER_TPL.animBowController;

        if (ac) {
            ctx.save();
            ctx.scale(h.facing || 1, 1);

            // When bow shooting: hide bow parts from main, draw bow controller on top
            if (h.weapon === 'bow' && h.bowShooting && abc) {
                // Hide bow parts + right_arm from main anim
                ac.force_hide = ALL_WEAPON_PARTS.concat(['right_arm']);
                ac.force_show = [];
                ac.draw(ctx, 0, 3, 0.3);
                // Draw bow controller on top
                abc.draw(ctx, -16, -16, 0.3);
            } else {
                applyWeaponVisibility();
                ac.draw(ctx, 0, 3, 0.3);
            }
            ctx.restore();
        }

        ctx.globalAlpha = 1;

        // ---- Weapon swing overlay ----
        if (h.swingActive) {
            drawWeaponSwing(ctx);
        }

        ctx.restore();

        // Health bar
        var bx = px - sz/2, by = py - half - 8 - 36, bw = sz, bh = 3;
        ctx.fillStyle = '#111'; ctx.fillRect(bx, by, bw, bh);
        var pp = h.hp / h.maxHp;
        ctx.fillStyle = pp > 0.5 ? '#3a8a3a' : pp > 0.25 ? '#8a6a18' : '#8a1818';
        ctx.fillRect(bx, by, bw * pp, bh);
        ctx.strokeStyle = 'rgba(255,255,180,0.15)'; ctx.lineWidth = 0.5;
        ctx.strokeRect(bx, by, bw, bh);

        if (h.stamina < h.maxStamina || h.staminaRegenDelay > 0) {
            var sp = h.stamina / h.maxStamina;
            by += 5;
            ctx.fillStyle = '#111'; ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#d0bf3a'; ctx.fillRect(bx, by, bw * sp, bh);
            ctx.strokeStyle = 'rgba(255,230,120,0.2)'; ctx.strokeRect(bx, by, bw, bh);
        }

        // Mana bar (for staff)
        if (h.mana < h.maxMana && h.weapon === 'staff') {
            var mp = h.mana / h.maxMana;
            by += 5;
            ctx.fillStyle = '#111'; ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = '#4488cc'; ctx.fillRect(bx, by, bw * mp, bh);
            ctx.strokeStyle = 'rgba(100,160,255,0.2)'; ctx.strokeRect(bx, by, bw, bh);
        }

        // Floating annotations
        var ax = px - sz/2 - 16, ay = py - half - 8 - 46;
        for (var i = 0; i < env.annotations.length; i++) {
            var an = env.annotations[i];
            var a2 = Math.min(1, an.life / an.maxLife);
            ctx.globalAlpha = a2 * a2;
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.font = '11px Courier New';
            ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
            ctx.fillText(an.text, ax+1, ay+1);
            ctx.fillStyle = an.color; ctx.fillText(an.text, ax, ay);
            ay -= 15;
        }
        ctx.globalAlpha = 1;
    };

    // Draw aim direction indicator - colored cells around player
    function drawAimIndicator(ctx, px, py) {
        var angle = h.aimAngle;
        var cos = Math.cos(angle), sin = Math.sin(angle);
        // Show 2 cells in aim direction
        for (var step = 1; step <= 3; step++) {
            var wx = px + cos * env.TILE * step;
            var wy = py + sin * env.TILE * step;
            var tc = Math.floor(wx / env.TILE);
            var tr = Math.floor(wy / env.TILE);
            if (env.isWall(tc, tr)) break;
            var alpha = 0.55 - step * 0.12;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffee44';
            ctx.fillRect(tc * env.TILE + 2, tr * env.TILE + 2, env.TILE - 4, env.TILE - 4);
            // Arrow indicator
            ctx.fillStyle = '#fff';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('›', tc * env.TILE + env.TILE/2, tr * env.TILE + env.TILE/2);
        }
        ctx.globalAlpha = 1;

        // Draw angle line from player
        ctx.save();
        ctx.strokeStyle = 'rgba(255,238,68,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + cos * env.TILE * 3.5, py + sin * env.TILE * 3.5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }

    // Draw weapon swing sprite overlay
    function drawWeaponSwing(ctx) {
        var parts = env.PLAYER_TPL.animController ? env.PLAYER_TPL.animController.getImages() : {};
        var imgKey = h.weapon === 'staff' ? 'magic_stick' : 'sword';
        var img = parts[imgKey];
        if (!img) return;

        var t = 1 - (h.swingTimer / h.swingDuration); // 0..1 progress
        var dc = h.swingDc, dr = h.swingDr;
        var baseAngle = Math.atan2(dr, dc);
        // Swing arc: from -70deg to +70deg around attack direction
        var swingArc = Math.PI * 0.78;
        var swingAngle = baseAngle - swingArc/2 + swingArc * t;
        var dist = env.TILE * 0.55;

        ctx.save();
        ctx.translate(Math.cos(swingAngle) * dist, Math.sin(swingAngle) * dist);
        ctx.rotate(swingAngle + Math.PI * 0.25);
        // Scale based on weapon
        var sc = (h.weapon === 'staff') ? 0.22 : 0.20;
        // Facing flip
        ctx.scale(h.facing || 1, 1);
        var iw = img.width * sc, ih = img.height * sc;
        var alpha = 0.85 - t * 0.3;
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, -iw/2, -ih/2, iw, ih);
        ctx.restore();
        ctx.globalAlpha = 1;
    }

    h.drawShadow = function(ctx) {
        var hopT = Math.max(0, Math.min(1, 1 - h.moveHop));
        env.drawShadow(ctx, h, hopT);
    };

    h.blockingMove = function(dc, dr) {
        h.moveHop = 1;
        h.nudge = { x: -dc*10, y: -dr*10, t: 0.09 };
    };

    h.checkLvlUp = function() {
        while (h.xp >= h.xpNext) {
            h.xp -= h.xpNext; h.level++;
            h.xpNext = Math.floor(h.xpNext * 1.6);
            h.statPoints = (h.statPoints||0) + 1;
            env.addLog('⬆ УРОВЕНЬ ' + h.level + '!', 'pick');
        }
    };

    h.spendStamina = function(cost) {
        h.stamina = Math.max(0, h.stamina - cost);
        h.staminaRegenDelay = 0.35;
        h.attackCooldown = 0.13;
    };

    h.canMeleeAttack = function() {
        if (h.attackCooldown > 0) return false;
        if (h.stamina < 20) { env.addLog('Выдохлась...', 'info'); return false; }
        return true;
    };

    // Trigger weapon swing animation
    h.startSwing = function(dc, dr) {
        h.swingActive = true;
        h.swingTimer = h.swingDuration;
        h.swingDc = dc; h.swingDr = dr;
    };

    // Attack by direction dc, dr (melee)
    h.attack = function(dc, dr) {
        var nc = h.c + dc, nr = h.r + dr;
        for (var i = 0; i < env.entities.length; i++) {
            var e = env.entities[i];
            if (!e.isMonster || e.dead) continue;
            if (e.c === nc && e.r === nr) {
                if (!h.canMeleeAttack()) return true;
                
                h.spendStamina(20);
                
                var atk = h.atk;
                
                var rndAtkMin = -1; 
                var rndAtkMax = 1;
                var minAtk = 1;
                
                if (h.isRangedWeapon()) {
                    atk -= 6;
                    minAtk = 0;
                    rndAtkMax=0;
                    rndAtkMin=0;
                }
                
                if (atk <= 0) atk = 1;
                
                var dmg = env.doCombat(atk, e.def, rndAtkMin, rndAtkMax, minAtk);
                
                e.hp -= dmg; e.hitFlash = 0.3;
                e.nudge = {x: dc*14, y: dr*14, t: 0.18};
                h.nudge = {x: dc*8, y: dr*8, t: 0.1};
                var wx = e.c*env.TILE+env.TILE/2+dc*env.TILE*0.4;
                var wy = e.r*env.TILE+env.TILE/2+dr*env.TILE*0.4;
                env.spawnHit(wx, wy, dc, dr, e.def.color);
                env.spawnDmgNum(wx, wy-16, dmg, '#ffee44');
                if (env.PLAYER_TPL.animController) env.PLAYER_TPL.animController.playOnce('attack','idle');
                h.startSwing(dc, dr);
                if (e.hp <= 0) e.kill();
                return true;
            }
        }
        return false;
    };

    h.whiff = function(dc, dr) {
        if (!h.canMeleeAttack()) return false;
        h.spendStamina(20);
        h.nudge = {x: dc*7, y: dr*7, t: 0.08};
        var wx2 = env.player.c*env.TILE+env.TILE/2+dc*env.TILE*0.6;
        var wy2 = env.player.r*env.TILE+env.TILE/2+dr*env.TILE*0.6;
        env.spawnHit(wx2, wy2, dc, dr, '#d0c080');
        if (env.PLAYER_TPL.animController) env.PLAYER_TPL.animController.playOnce('attack','idle');
        h.startSwing(dc, dr);
    };

    // Staff attack: shoot magic projectile, costs mana
    h.staffAttack = function(dc, dr) {
        var manaCost = 15;
        if (h.mana < manaCost) { env.addLog('Нет маны!', 'info'); return false; }
        if (h.attackCooldown > 0) return false;
        h.mana = Math.max(0, h.mana - manaCost);
        h.manaRegenDelay = 0.5;
        h.attackCooldown = 0.4;
        
        var baseAngle = Math.atan2(dr, dc);
        
        console.log(dr + ' ' + dc);
        // небольшой наклон вниз при диагонали
        var angle = baseAngle;
        
        if (dr == 0 && dc == -1)
        angle -= 0.3;
        else if (dr == 0 && dc == 1) 
        angle = 0.3;
        
        angle += rand(-0.05, 0.05);
        
        var staffYOffset = -40;

        var fx = h.x + Math.cos(angle) * env.TILE * 0.6;
        var fy = h.y + staffYOffset + Math.sin(angle) * env.TILE * 0.6;
                
        
        // Staff bolts: no ricochet, faster, magic color
        var speed = env.TILE * 11;
        var proj = new Projectile(env);
        var project = proj.make(fx, fy, Math.cos(angle)*speed, Math.sin(angle)*speed, h.atk + 3, 10);
            project.type = 'magic';
        proj.isMagic = true; // flag for draw override
        env.projectiles.push(proj);
        // Visual: magic particles from staff tip
        for (var pi = 0; pi < 6; pi++) {
            var a = angle + rand(-0.4, 0.4);
            env.spawnParticle(fx, fy, Math.cos(a)*rand(30,80), Math.sin(a)*rand(30,80), 0.35, '#88aaff', rand(3,6));
        }
        env.addLog('✦ Магический заряд!', 'info');
        if (env.PLAYER_TPL.animController) env.PLAYER_TPL.animController.playOnce('attack','idle');
        h.startSwing(dc, dr);
        return true;
    };

    h.isRangedWeapon = function() {
        return h.weapon === 'bow' || h.weapon === 'staff';
    };

    // Enter ranged aiming mode
    h.enterAim = function() {
        if (!h.isRangedWeapon()) return;
        if (h.weapon === 'bow' && h.arrows <= 0) { env.addLog('Нет стрел!', 'hit'); return; }
        h.bowAiming = true;
        // Default aim angle: current look direction
        if (h.lastDc === 0 && h.lastDr === 0) {
            h.lastDc = h.facing === -1 ? 1 : -1;
            h.lastDr = 0;
        }
        h.aimAngle = Math.atan2(h.lastDr, h.lastDc);
    };

    // Shoot in current aim angle
    h.bowShoot = function() {
        if (h.weapon !== 'bow') return;
        if (h.arrows <= 0) { env.addLog('Нет стрел!', 'hit'); h.bowAiming = false; return; }
        h.arrows--;
        var angle = h.aimAngle;
        var speed = env.TILE * 9;
        var fx = h.x + Math.cos(angle) * env.TILE * 0.6;
        var fy = h.y + Math.sin(angle) * env.TILE * 0.6;
        var proj = new Projectile(env);
        proj.make(fx, fy, Math.cos(angle)*speed, Math.sin(angle)*speed, h.atk + 2, 10);
        env.projectiles.push(proj);
        env.addLog(h.arrows + ' стрел', 'info');
        // Bow animation
        var abc = env.PLAYER_TPL.animBowController;
        if (abc) {
            abc.playOnce('prepare', 'end');
        }
        h.bowShooting = true;
        h.bowShootTimer = 0.55;
        // After bow animation, reset
        setTimeout(function(){ h.bowShooting = false; }, 600);
    };

    h.staffShoot = function() {
        if (h.weapon !== 'staff') return;
        var dc = Math.round(Math.cos(h.aimAngle));
        var dr = Math.round(Math.sin(h.aimAngle));
        if (dc === 0 && dr === 0) {
            dc = h.facing === -1 ? 1 : -1;
        }
        h.lastDc = dc;
        h.lastDr = dr;
        if (dc !== 0) h.facing = dc > 0 ? -1 : 1;
        h.staffAttack(dc, dr);
    };

    h.rangedShoot = function() {
        if (h.weapon === 'bow') h.bowShoot();
        else if (h.weapon === 'staff') h.staffShoot();
        h.bowAiming = false;
    };
    
    h.updateAimFacing = function() {
        var dc = Math.cos(h.aimAngle);
        if (dc !== 0) h.facing = dc > 0 ? -1 : 1;
    }
    
    // Aim with arrows/WASD: up/down rotates angle, left/right flips look direction
    h.bowAimDir = function(dc, dr) {
        if (!h.bowAiming) return;
        if (dc === 0 && dr === 0) return;

        if (dr !== 0) {
            var step = Math.PI / 4;
                        
            var nangle = h.aimAngle + (dr < 0 ? -step : step);
            var EPS = 0.0001;
            var ndc = Math.cos(nangle);

            var newfacing = null;

            if (ndc > EPS) newfacing = -1;
            else if (ndc < -EPS) newfacing = 1;

            // если близко к вертикали — не меняем facing
            if (newfacing !== null && newfacing != h.facing) return;
            h.aimAngle = nangle;
            return;
        }

        if (dc !== 0) {
            h.lastDc = dc;
            h.lastDr = 0;
            h.aimAngle = Math.atan2(0, dc);
        }
        h.updateAimFacing();
    };

    // Aim toward mouse world position
    h.bowAimMouse = function(wx, wy) {
        if (!h.bowAiming) return;
        h.aimAngle = Math.atan2(wy - h.y, wx - h.x);
        h.updateAimFacing();
    };

    h.kill = function() {
        env.gameOver = true;
        env.modal = 'gameover';
        env.modalTimer = 3;
        env.canvasButtons = [];
        if (env.map[h.r]) env.map[h.r][h.c] = 3;
        h.hp = 0;
        env.spawnFairyFX(h.x, h.y, '#996633');
    };
}
