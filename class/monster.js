
function Monster(env) {

    var h = this;
    h.isMonster = true;

    h.makeAim = function() {
        h._aimCooldown = rand(3.0, 5.0);
        h._aiAimTimer  = 0;
        h._aiAiming    = false;
        h._aiAimAngle  = 0;
        h._aiTargetAngle = 0; 
        h._aiAimBounces  = 2;
        if (h.ai == 'spider') h._aiAimBounces = 0;
    };

    h.make = function(type, c, r) {
        var def = MDEFS[type];
        h.kind   = type;
        h.def    = def.def;
        h.name   = def.name;
        h.origin = def;
        h.x = c * env.TILE + env.TILE / 2;
        h.y = r * env.TILE + env.TILE / 2;
        h.c = c;
        h.r = r;
        h.hp     = def.hp;
        h.maxHp  = def.hp;
        h.atk    = def.atk;
        h.xp     = def.xp;
        h.gold   = def.gold;
        h.speed  = def.speed;
        h.ai     = def.ai;
        h.facing = 1;
        h.hopTimer  = 0;
        h.hopSpeed  = 6 * def.speed; // randi(7, 12) * def.speed;
        h.hitFlash  = 0;
        h.nudge = { x: 0, y: 0, t: 0 };
        h.path      = [];
        h.pathTimer = 0;
        h.stateTimer = rand(0.5, 2.0);
        h.patrolDir  = { c: randi(-1, 1) || 1, r: 0 };
        h.aggro  = false;
        h.dead   = false;
        h.lastDc = 0;
        h.lastDr = 0;
        h.keyDrop = null;
        
        if (h.ai === 'slime' || h.ai === 'spider') {
            h.makeAim();
        }

        return h;
    };

    function aggroR(deaggr) {
        return VIS[deaggr ? 'de_' + h.ai : h.ai];
    }
    
    h.tryMeleeAttack = function(player) {
        var sRow = h.r === player.r && Math.abs(h.c - player.c) === 1;
        var sCol = h.c === player.c && Math.abs(h.r - player.r) === 1;
        if (!( player.hp > 0 && (sRow || sCol) && h.stateTimer <= 0 )) return false;

        var dc2 = player.c - h.c;
        var dr2 = player.r - h.r;
        if (dc2 !== 0) dc2 = dc2 > 0 ? 1 : -1;
        if (dr2 !== 0) dr2 = dr2 > 0 ? 1 : -1;
        h.lastDc = dc2;
        h.lastDr = dr2;

        var dmg = env.doCombat(h.atk, player.def);
        player.hp -= dmg;
        player.hitFlash = 0.28;
        player.nudge = { x: dc2 * 12, y: dr2 * 12, t: 0.15 };

        if (env.PLAYER_TPL.animController) env.PLAYER_TPL.animController.playOnce('hit', 'idle');

        var wx = player.c * env.TILE + env.TILE / 2 + dc2 * env.TILE * 0.3;
        var wy = player.r * env.TILE + env.TILE / 2 + dr2 * env.TILE * 0.3;
        env.spawnHit(wx, wy, dc2, dr2, '#5888cc');
        env.spawnDmgNum(wx, wy - 18, dmg, '#ff4444');

        h.stateTimer = 0.9 / h.speed;
        if (player.hp <= 0) player.kill();
        return true;
    };

    // Вызывается каждый кадр когда моб в агро и хочет стрелять.
    // Возвращает:
    //   'shoot'     — прицеливание завершено И есть попадание  стрелять
    //   'interrupt' — моб получил удар во время прицеливания  сбросить
    //   'no_hit'    — нет линии попадания сбросить прицел
    //   false       — продолжаем прицеливаться
    var AIM_DURATION      = 1.2;  // секунд прицеливания перед выстрелом
    var AIM_LERP          = 4.0;  // скорость поворота прицела (рад/с)

    h._aimWasHit = false; // флаг: получил урон в прошлом кадре

    h.updateAim = function(dt) {
        var gotHit = (h.hitFlash > 0 && !h._aimWasHit);
        h._aimWasHit = (h.hitFlash > 0);
        if (gotHit && h._aiAiming) {
            return 'interrupt';
        }

        // Целевой угол — в сторону игрока
        h._aiTargetAngle = Math.atan2(
            env.player.y - h.y,
            env.player.x - h.x
        );

        if (!h._aiAiming) {
            // Начать прицеливание
            h._aiAiming   = true;
            h._aiAimTimer = AIM_DURATION;
            h._aiAimAngle = h._aiTargetAngle;
        }

        var diff = h._aiTargetAngle - h._aiAimAngle;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        h._aiAimAngle += diff * Math.min(1, AIM_LERP * dt);

        var simCheck = new Projectile(env);
        var canHit = simCheck.simulateHitsPlayer(h.x, h.y, h._aiAimAngle, h._aiAimBounces);
        if (!canHit) {
            if (h._aiAiming) return 'no_hit';
            return false;
        }

        h._aiAimTimer -= dt;
        if (h._aiAimTimer <= 0) return 'shoot';
        return false;
    };

    h.resetAim = function(cooldownMin, cooldownMax) {
        h._aiAiming   = false;
        h._aiAimTimer = 0;
        h._aimWasHit  = false;
        h._aimCooldown = rand(cooldownMin || 2.5, cooldownMax || 5.0);
    };

    h.drawAimDot = function(ctx, color) {
        if (!h._aiAiming) return;
        var progress = 1 - Math.max(0, h._aiAimTimer / AIM_DURATION);
        var dist = env.TILE * 0.9;
        var dotX = h.x + Math.cos(h._aiAimAngle) * dist;
        var dotY = h.y + Math.sin(h._aiAimAngle) * dist;
        var sz   = 3 + 3 * progress; // растёт по мере прицеливания
        ctx.save();
        ctx.globalAlpha = 0.5 + 0.5 * progress;
        ctx.fillStyle = color || '#33ff33';
        ctx.fillRect(dotX - sz / 2, dotY - sz / 2, sz, sz);
        ctx.restore();
    };

    var _aimBobPhase = rand(0, Math.PI * 2);

    h.getAimBobOffset = function(dt) {
        if (!h._aiAiming) return { x: 0, y: 0 };
        _aimBobPhase += dt * 28;
        return {
            x: Math.sin(_aimBobPhase) * env.TILE * 0.18,
            y: Math.abs(Math.sin(_aimBobPhase * 0.9)) * env.TILE * 0.1
        };
    };

    function _slimeTryShoot() {
        var fx = h.x, fy = h.y;
        var STEP_DEG  = 9;
        var speed = env.TILE * 7;

        for (var deg = 0; deg < 360; deg += STEP_DEG) {
            var angle = deg * Math.PI / 180;
            var sim = new Projectile(env);
            var hitPath = sim.simulateHitsPlayer(fx, fy, angle, h._aiAimBounces);
            if (hitPath) {
                sim.make(fx, fy, Math.cos(angle) * speed, Math.sin(angle) * speed, h.atk, h._aiAimBounces);
                sim.type = 'slime';
                sim.dangerTimeout = 0.0;
                env.projectiles.push(sim);
                for (var pi = 0; pi < 4; pi++) {
                    var a = angle + rand(-0.3, 0.3);
                    env.spawnParticle(fx, fy, Math.cos(a) * rand(30, 70), Math.sin(a) * rand(30, 70), 0.3, '#33cc33', rand(2, 5));
                }
                return;
            }
        }
        var baseAngle = Math.atan2(env.player.y - fy, env.player.x - fx) + rand(-0.4, 0.4);
        var sim2 = new Projectile(env);
        sim2.make(fx, fy, Math.cos(baseAngle) * speed, Math.sin(baseAngle) * speed, h.atk, h._aiAimBounces);
        sim2.type = 'slime';
        sim2.dangerTimeout = 0.0;
        env.projectiles.push(sim2);
    }

    function _spiderTryShoot() {
        var fx = h.x, fy = h.y;
        var speed = env.TILE * 6;
        var angle = h._aiAimAngle; // используем текущий угол прицела
        var proj = new Projectile(env);
        proj.make(fx, fy, Math.cos(angle) * speed, Math.sin(angle) * speed, h.atk, h._aiAimBounces);
        proj.type = 'slime'; // todo web logic
        proj.dangerTimeout = 0.0;
        env.projectiles.push(proj);
        for (var pi = 0; pi < 5; pi++) {
            var a = angle + rand(-0.4, 0.4);
            env.spawnParticle(fx, fy, Math.cos(a) * rand(20, 60), Math.sin(a) * rand(20, 60), 0.35, '#aaaaff', rand(2, 4));
        }
    }
    
    function updateFacing(d) {
        if (d.c !== 0) h.facing = d.c > 0 ? -1 : 1;
        if (d.c !== 0 || d.r !== 0) { 
            h.lastDc = d.c; 
            h.lastDr = d.r; 
        }
    }

    // Сделать один шаг по тайловой сетке в сторону игрока (pathfind).
    // stopDist — остановиться если pd <= stopDist (не входить вплотную).
    // Возвращает true если шаг был сделан.
    function _moveTowardPlayer(stopDist) {
        if (h.pathTimer <= 0) {
            h.path = env.pathfinder.find(h.c, h.r, env.player.c, env.player.r);
            h.pathTimer = 1.0;
        }
        var minLen = (stopDist || 0) > 0 ? 2 : 1; // path[0] это следующий шаг, path.length>1 = есть куда идти не занимая клетку игрока
        if (h.path.length < minLen) return false;
        var d = {c : h.path[0].c - h.c, r : h.path[0].r - h.r};
        
        updateFacing(d);
        
        var nc = h.c + d.c, nr = h.r + d.r;
        if (!env.isWall(nc, nr) && !(nc === env.player.c && nr === env.player.r)) {
            for (var i = 0; i < env.entities.length; i++) {
                var e = env.entities[i];
                if (e.isMonster && !e.dead && e !== h && e.c === nc && e.r === nr) return false;
            }
            h.c = nc; h.r = nr;
        }
        h.path.shift();
        return true;
    }

    // Сделать один шаг подальше от игрока (максимизировать mdist).
    function _moveAwayFromPlayer() {
        
        var DIRS = [{ c: 1, r: 0 }, { c: -1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: -1 }];
        var best = -Infinity, d = {c : 0, r : 0};
        
        for (var i = 0; i < DIRS.length; i++) {
            var nc = h.c + DIRS[i].c, nr = h.r + DIRS[i].r;
            if (env.isWall(nc, nr)) continue;
            var s = mdist(nc, nr, env.player.c, env.player.r);
            if (s > best) { best = s; d.c = DIRS[i].c; d.r = DIRS[i].r; }
        }
        
        if (d.c === 0 && d.r === 0) return;
        
        var nc2 = h.c + d.c, nr2 = h.r + d.r;
        
        if (!env.isWall(nc2, nr2) && !(nc2 === env.player.c && nr2 === env.player.r)) {
            for (var j = 0; j < env.entities.length; j++) {
                var e2 = env.entities[j];
                if (e2.isMonster && !e2.dead && e2 !== h && e2.c === nc2 && e2.r === nr2) return;
            }
            h.c = nc2; h.r = nr2;
        }
        updateFacing(d);
    }

    function _moveRandom() {
        
        var d = {c : 0, r : 0};
        refreshPath();
        
        if (h.aggro && h.path.length > 0) {
         
            if (h.path.length > 0) {
                d.c = h.path[0].c - h.c;
                d.r = h.path[0].r - h.r;
            }
            
        } else {
            var dd2 = [{ c: 1, r: 0 }, { c: -1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: -1 }];
            var ddd = dd2[randi(0, 3)];
            d.c = ddd.c;
            d.r = ddd.r;
        }
        
        return d;
    }

    // Обновить позицию (плавный lerp к тайловой позиции + боб при прицеле).
    function _smoothPos(dt, lerpK) {
        var bob = h.getAimBobOffset(dt);
        var tx = h.c * env.TILE + env.TILE / 2 + (h.nudge ? h.nudge.x : 0) + bob.x;
        var ty = h.r * env.TILE + env.TILE / 2 + (h.nudge ? h.nudge.y : 0) + bob.y;
        h.x += (tx - h.x) * (lerpK || 0.18);
        h.y += (ty - h.y) * (lerpK || 0.18);
    }

    //  SLIME AI  — убегает, стреляет рикошетами
    
    function _aiSlimeUpdate(dt, pd) {
        h._aimCooldown -= dt;

        if (!h.aggro) {
            h._aiAiming = false;
            if (h.stateTimer <= 0) {
                
                h.stateTimer = 0.5 / h.speed;
                var d = _moveRandom();
                validateMove(d);
                updateFacing(d);
            }
        } else {
            // Движение: убегаем когда не прицеливаемся
            if (!h._aiAiming && h.stateTimer <= 0) {
                h.stateTimer = 0.4 / h.speed;
                _moveAwayFromPlayer();
            }

            // Прицеливание и выстрел
            if (h._aimCooldown <= 0 && pd <= 9) {
                var res = h.updateAim(dt);
                if (res === 'shoot') {
                    _slimeTryShoot();
                    h.resetAim(2.5, 5.0);
                } else if (res === 'interrupt') {
                    h.resetAim(1.5, 3.0); // убит — убегаем
                } else if (res === 'no_hit') {
                    // нет линии попадания — сбрасываем прицел и сразу двигаемся
                    h.resetAim(0.8, 1.5);
                    if (h.stateTimer <= 0) {
                        h.stateTimer = rand(0.5, 1.0);
                        var d = _moveRandom();
                        validateMove(d);
                        updateFacing(d);
                    }
                }
            } else {
                h._aiAiming = false;
            }
        }

        _smoothPos(dt, 0.18);
    }

    //  SPIDER AI  — держит дистанцию, стреляет паутиной,
    //               атакует в мили если игрок рядом или обездвижен

    function _aiSpiderUpdate(dt, pd) {
        h._aimCooldown -= dt;
        
        if (!h.aggro) {
            h._aiAiming = false;
            if (h.stateTimer <= 0) {
                h.stateTimer = rand(0.6, 1.4);
                var d = _moveRandom();
                validateMove(d);
            }
            _smoothPos(dt, 0.18);
            return;
        }

        var playerStuck = !!env.player.stuck;
        var goMelee = playerStuck || (pd <= 2);  // < 2 тайлов — переходим в ближний бой

        if (goMelee) {
            //  Ближний бой 
            h._aiAiming = false;
            // Сначала пробуем ударить
            if (h.tryMeleeAttack(env.player)) {
                _smoothPos(dt, 0.18);
                return;
            }
            // Не достаём — идём вплотную
            if (h.stateTimer <= 0) {
                h.stateTimer = 0.5 / h.speed;
                _moveTowardPlayer(0); // stopDist=0 — подходим вплотную
            }
        } else {
            //  Дистанционный режим
            if (!h._aiAiming && h.stateTimer <= 0) {
                
                h.stateTimer = 0.5 / h.speed;
                var d = _moveRandom();
                validateMove(d);
                updateFacing(d);
            }

            // Прицеливание и выстрел
            if (h._aimCooldown <= 0 && pd <= 9) {
                var res2 = h.updateAim(dt);
                if (res2 === 'shoot') {
                    _spiderTryShoot();
                    h.resetAim(2.0, 4.5);
                } else if (res2 === 'interrupt') {
                    h.resetAim(0.5, 1.0);
                    h.path = env.pathfinder.find(h.c, h.r, env.player.c, env.player.r);
                    h.pathTimer = 1.0;
                } else if (res2 === 'no_hit') {
                    h.resetAim(0.6, 1.2);
                    if (h.stateTimer <= 0) {
                        h.stateTimer = 0.5 / h.speed;
                        _moveTowardPlayer(4);
                    }
                }
            } else {
                h._aiAiming = false;
            }
        }

        _smoothPos(dt, 0.18);
    }
    
    function validateMove(d) {
         var nc7 = h.c + d.c, nr7 = h.r + d.r;
         var moved = false;
        if (!env.isWall(nc7, nr7) && !(nc7 === env.player.c && nr7 === env.player.r)) {
            var bl5 = false;
            for (var i = 0; i < env.entities.length; i++) {
                var e = env.entities[i];
                if (e.isMonster && !e.dead && e !== h && e.c === nc7 && e.r === nr7) { bl5 = true; break; }
            }
            if (!bl5) { moved = true; h.c = nc7; h.r = nr7; }
        }
        
        return moved;
    }
    
    function refreshPath() {
        if (h.pathTimer <= 0) {
            h.path = env.pathfinder.find(h.c, h.r, env.player.c, env.player.r);
            h.pathTimer = h.ai === 'boss' ? 0.7 : 1.2;
        }  
        
    }
    
    h.update = function(dt) {
        if (h.dead || !env.player) return;

        var player = env.player;
        var pd = mdist(h.c, h.r, player.c, player.r);
        
        h.pathTimer  -= dt;
        h.stateTimer -= dt;
        h.hopTimer   += dt * h.hopSpeed;

        if (h.hitFlash > 0) h.hitFlash -= dt;
        if (h.nudge.t > 0) {
            h.nudge.t -= dt;
            if (h.nudge.t < 0) { h.nudge.x = 0; h.nudge.y = 0; }
        }

        if (pd <= h.origin.ai_agr)   h.aggro = true;
        if (pd > h.origin.ai_deagr) h.aggro = false;
        
        if (h.ai === 'slime') {
            _aiSlimeUpdate(dt, pd);
            return;
        }

        if (h.ai === 'spider') {
            _aiSpiderUpdate(dt, pd);
            return;
        }

        // default ai

        // Ближняя атака (общий метод)
        if (h.tryMeleeAttack(player)) return;
        
    
        if (h.stateTimer <= 0) {
            
            if (h.aggro) refreshPath();
            
            h.stateTimer = 0.5 / h.speed;
            var d = {c : 0, r : 0};
            if (h.path.length > 0) {
             
                d.c = h.path[0].c - h.c;
                d.r = h.path[0].r - h.r;
                
                if (Math.abs(d.c) > 1 || Math.abs(d.r) > 1) {
                    d.c = 0;
                    d.r = 0;
                    h.pathTimer = 0;
                    refreshPath();
                } 
            }
            
            // if ((h.ai === 'chase' || h.ai === 'boss') && h.aggro) {
             
            if (h.ai === 'patrol') {
                if (!h.aggro) {
                    d.c = h.patrolDir.c;
                    d.r = h.patrolDir.r;
                    if (env.isWall(h.c + d.c, h.r + d.r) || Math.random() < 0.2) {
                        h.patrolDir = { c: [-1, 0, 1][randi(0, 2)], r: [-1, 0, 1][randi(0, 2)] };
                        d.c = h.patrolDir.c;
                        d.r = h.patrolDir.r;
                    }
                }

            } else if (h.ai === 'random') {
                d = _moveRandom();
            }

            if (h.path.length < 0 && d.c !== 0 && d.r !== 0) {
                if (Math.random() < 0.5) d.c = 0; else d.r = 0;
            }
            
            updateFacing(d);
            if (validateMove(d) && h.path.length > 0) h.path.shift();
        }

        var tx3 = h.c * env.TILE + env.TILE / 2 + h.nudge.x;
        var ty3 = h.r * env.TILE + env.TILE / 2 + h.nudge.y;
        h.x += (tx3 - h.x) * 0.22;
        h.y += (ty3 - h.y) * 0.22;
    };

    h.draw = function(ctx) {
        var sz   = env.TILE * 0.82;
        var half = sz / 2;

        var hopY = Math.abs(Math.sin(h.hopTimer));
        var hy   = hopY * env.TILE * 0.18;
        var px   = h.x;
        var py   = h.y - hy;

        var sprite = SPRITES[h.origin.sk] && SPRITES[h.origin.sk].img ? SPRITES[h.origin.sk] : null;
        if (!sprite) { console.log('no sprite for unit ' + h.name); return; }

        var al = 1;
        if (h.hitFlash > 0) al = 0.35 + 0.65 * Math.abs(Math.sin(h.hitFlash * 38));
        ctx.globalAlpha = al;

        ctx.save();
        ctx.translate(px, py);
        ctx.scale(h.facing || 1, 1);
        env.drawSpr(ctx, h.origin.sk, 0, 0, sz);
        ctx.restore();
        ctx.globalAlpha = 1;

        var bx = px - half, by = 0, bw = sz, bh = 3;

        if (h.maxHp > 1 && h.hp < h.maxHp) {
            by = py - half - 8;
            by += sprite.ty;
            ctx.fillStyle = '#111';
            ctx.fillRect(bx, by, bw, bh);
            var pp = h.hp / h.maxHp;
            ctx.fillStyle = pp > 0.5 ? '#3a8a3a' : pp > 0.25 ? '#8a6a18' : '#8a1818';
            ctx.fillRect(bx, by, bw * pp, bh);
            ctx.strokeStyle = 'rgba(255,255,180,0.15)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(bx, by, bw, bh);
        }

        if (h.aggro) {
            ctx.font = '7px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            var nameColor = h.kind === 'boss' ? '#ff3333' : '#cc7722';
            ctx.fillStyle = nameColor;
            by = py - half - (h.maxHp > 1 && h.hp < h.maxHp ? 12 : 3);
            by += sprite.ty;
            ctx.fillText(h.name || '', px, by);
        }

        // Рисуем прицел для стреляющих мобов
        if (h.ai === 'slime') h.drawAimDot(ctx, '#33ff33');
        if (h.ai === 'spider') h.drawAimDot(ctx, '#aaaaff');
    };

    h.drawShadow = function(ctx) {
        if (!SPRITES[h.origin.sk] || !SPRITES[h.origin.sk].img) return;
        var hopT = Math.max(0, Math.min(1, 1 - Math.abs(Math.sin(h.hopTimer))));
        env.drawShadow(ctx, h, hopT);
    };
    
    h.kill = function() {
        if (h.dead) return;
        h.dead = true;
        env.spawnDeath(h.x, h.y, h.def.color);
        env.player.xp += h.xp;
        env.addLog('✦ ' + h.origin.name + ' +' + h.xp + 'xp', 'kill');
        if (h.keyDrop) {
            env.dropItemFromMob(h.keyDrop, h);
            env.addLog('Выпал ключ!', 'pick');
        }

        if (Math.random() < 0.4) env.dropItemFromMob('gold', h).valLocal = randi(1, h.gold);
        else {
            if (Math.random() < 0.3) env.dropItemFromMob('potion', h);
            if (Math.random() < 0.3) {
                if (env.player.hp < env.player.maxHp) env.dropItemFromMob('potion', h);
                else env.dropItemFromMob('arrows', h);
            }
            if (Math.random() < 0.3) env.dropItemFromMob('gold', h).valLocal = randi(1, h.gold);
        }
        env.player.checkLvlUp();
        env.entities = env.entities.filter(function(e) { return !e.dead; });
    };
}
