function ItemEntity(env) {
  var h = this;

  h.make = function(type, c, r) {
      
    var def = IDEFS[type];
    
    h.picked = false;
    h.valLocal = -1;
    h.isItem=true; 
    h.isPickable = true;
    h.kind=type; 
    h.origin = def;
    h.x=c*env.TILE+env.TILE/2;
    h.y=r*env.TILE+env.TILE/2;
    h.c=c;
    h.r=r;
    h.hopTimer=rand(0,10);
    h.hopSpeed=0.5;
    h.bob=rand(0,Math.PI*2);
    h.fly=null; // процесс падения, дропа итема из моба


    // Static: treated as wall, blocks passage
    h.isStatic = def.isStatic || false;
    h.isBlocking = def.isBlocking || false;
    // Destructable: can be destroyed by attacks/projectiles
    if (def.isDestructable) {
      h.isDestructable = true;
      h.hp = def.hp || randi(10, 20);
    } else {
      h.isDestructable = false;
    }

    return h;
  };

  h.pickup = function() {
      
      if (!h.isPickable) return false;
      
      // Static items can't be picked up normally
      if (h.isStatic) {
          // Check if player is inside — set isStuck flag
         // var pl = env.player;
         // if (pl && pl.c === h.c && pl.r === h.r) {
         //     pl.isStuck = true;
         // }
          return false;
      }

      if (h.picked) return true;
      var def = h.origin;
      var pl = env.player;

      h.picked = true;
      
      if (def.type === 'gold') {
          
          pl.gold += h.valLocal > 0 ? h.valLocal : def.val;
          env.addLog('+' + h.valLocal + ' монет', 'pick');
          
      } else if (def.type === 'potion') {
          
          pl.items.push({kind: 'potion'});
          // pl.items.filter(function(x) {return x.kind === 'potion';}).length - num
          env.addLog('+ зелье', 'pick');
          
      } else if (def.type === 'ammo') {
          
          pl.arrows += def.val;
          env.addLog('+' + def.val + ' стрел', 'pick');
          
      } else if (def.type === 'weapon') {
          
          if (!pl.weapons.includes(def.weapon)) pl.weapons.push(def.weapon);
          env.addLog('Найден ' + def.name, 'pick');
          
      } else if (def.type === 'key') {
          
          pl.fairyKeys[def.keyId] = true;
          env.addLog(def.name, 'pick');
      }
      
      env.spawnHit(h.x, h.y, 0, -1, def.color);
      return true;
  };

  // Called by projectile or melee when this item is hit
  h.takeHit = function(dmg, angle) {
      if (!h.isDestructable || h.picked) return false;

      h.hp -= (dmg !== undefined ? dmg : randi(10, 20));

      // Spawn 2-3 large "chunk" particles flying in different directions
      var count = randi(2, 3);
      var baseAngle = (angle !== undefined) ? angle : Math.random() * Math.PI * 2;
      var col = (h.origin && h.origin.color) ? h.origin.color : '#a08060';
      for (var p = 0; p < count; p++) {
          var a = baseAngle + (p / count) * Math.PI * 2 + rand(-0.4, 0.4);
          var speed = rand(55, 110);
          env.spawnParticle(
              h.x, h.y,
              Math.cos(a) * speed,
              Math.sin(a) * speed,
              rand(0.45, 0.75),   // lifetime
              col,
              rand(5, 9),         // big chunk size
              'sp'
          );
      }
      // Small debris burst
      for (var q = 0; q < 4; q++) {
          var qa = Math.random() * Math.PI * 2;
          env.spawnParticle(
              h.x, h.y,
              Math.cos(qa) * rand(20, 60),
              Math.sin(qa) * rand(20, 60),
              rand(0.2, 0.4),
              col,
              rand(2, 4),
              'sp'
          );
      }

      env.spawnHit(h.x, h.y, 0, -1, col);

      if (h.hp <= 0) {
          // Remove from entities
          var idx = env.entities.indexOf(h);
          if (idx !== -1) env.entities.splice(idx, 1);
          return true; // destroyed
      }
      return false;
  };

  h.draw = function(ctx) {
    
    var bob = 0;
    
    if (!h.isStatic){
        bob = h.fly && h.fly.t> 0 ? 0 : Math.sin(h.hopTimer + h.bob) * 3.5;
    }
    
    var px=h.x;
    var py=h.y + bob;

    ctx.save();
    ctx.translate(px,py);
    if (!h.origin) {
        console.log(h);
        debugger;
    }  
    if(h.origin.type === 'key'){
        
      var grd=ctx.createRadialGradient(0,0,2,0,0,20);
      
      grd.addColorStop(0, h.origin.color + '55');
      grd.addColorStop(1,'transparent');
      
      ctx.fillStyle=grd;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI*2);
      ctx.fill();
    }
    
    if (h.origin.type === 'door') {
      
        var doorVertical = (h.door_dir === 'H'); // door_dir='H' значит стены сверху/снизу — дверь горизонтальна визуально; 'V' — повернуть
        if (h.door_open) {
            if (doorVertical) {
                env.drawSprTransform(ctx, h.origin.sk_open, 0, 0, true,  h.door_side != 'left', true);
                
            } else {
                env.drawSprTransform(ctx, h.origin.sk_open, 6,  h.door_side == 'down' ? -6 : 6, false, h.door_side != 'down', false);
              //  env.drawSpr(ctx, h.origin.sk_open, 0, 0, 1);
            }
        } else {  
            if (doorVertical) {
                env.drawSprTransform(ctx, h.origin.sk, 0, 0, true, h.door_side == 'left', true);
            } else {
                env.drawSpr(ctx, h.origin.sk, 0, 0, 1);
            }
        }

    } else if (h.origin.type === 'web_light') { 
     
        env.drawSprTransform(ctx, h.origin.sk, h.ox, h.oy, h.flip_h, h.flip_v, false);
        
    } else {
    
        env.drawSpr(ctx, h.origin.sk, 0, 0, SPRITES[h.origin.sk].scale_type);
    }
    
    ctx.restore();
  };
}
