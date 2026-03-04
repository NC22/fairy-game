function ItemEntity(env) {
  var h = this;

  h.make = function(type, c, r) {
      
    var def = IDEFS[type];
    
    h.picked = false;
    h.valLocal = -1;
    h.isItem=true; 
    h.kind=type; 
    h.origin = def;
    h.x=c*env.TILE+env.TILE/2;
    h.y=r*env.TILE+env.TILE/2;
    h.c=c;
    h.r=r;
    h.hopTimer=rand(0,10);
    h.hopSpeed=0.5;
    h.bob=rand(0,Math.PI*2);
    h.fly=null;
    
    return h;
  };

  h.pickup = function() {

      if (h.picked) return;
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
  };

  h.draw = function(ctx) {
      
    var bob = h.fly && h.fly.t> 0 ? 0 : Math.sin(h.hopTimer + h.bob) * 3.5;
    var px=h.x;
    var py=h.y + bob;
    var sz=env.TILE*0.56;
    
    ctx.save();
    ctx.translate(px,py);
    env.drawSpr(ctx, h.origin.sk, 0, 0, sz);
    
    if(h.origin.type === 'key'){
        
      var grd=ctx.createRadialGradient(0,0,2,0,0,20);
      
      grd.addColorStop(0, h.origin.color + '55');
      grd.addColorStop(1,'transparent');
      
      ctx.fillStyle=grd;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  };
}
