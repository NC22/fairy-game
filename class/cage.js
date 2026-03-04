function CageEntity(env) {
  var h = this;

  h.make = function(fid, c, r) {
      
    var def = CDEFS.find(function(d){return d.id===fid;})||CDEFS[0];
    
    h.broken = false;
    h.fairyAnim = new SpritePlayer(env.FAIRY_TPL.animObject.project,'idle',env.FAIRY_TPL.animObject.images);
    h.isCage = true;
    h.fairyId = fid;
    h.x=c*env.TILE+env.TILE/2;
    h.y=r*env.TILE+env.TILE/2;
    h.c=c; 
    h.r=r;
    h.origin = def;
    h.color= def.color; 
    h.label= def.label;
    h.freed=false;
    
    return h;
  };
  
  h.releaseFairy = function() {

    if(env.player.fairyKeys[h.fairyId]){
        h.freed = true;
        env.player.fairyKeys[h.fairyId] = false;
    } else {
        env.addLog('Нужен ' + IDEFS['key_' + h.fairyId].name,'info');
        return;
    }
    
    var fx = h.c * env.TILE + env.TILE/2;
    var fy = h.r * env.TILE + env.TILE/2;
    var f = new Fairy(env);
    
    env.fairies.push(f.make(h.origin, fx, fy));
    env.spawnFairyFX(fx, fy, h.origin.color);
    env.addLog(h.origin.label + ' на свободе!', 'fairy');
    
    // Mark globally rescued
    env.globalState.rescuedFairies[h.fairyId] = true;

    // Check all 3 rescued
    var allDone = CDEFS.every(function(d){ return env.globalState.rescuedFairies[d.id]; });
    if (allDone) {
      env.addLog('Все феи освобождены! Победа!', 'fairy');
      setTimeout(function(){ env.modal = 'win'; env.menuState.winLose = 0; env.canvasButtons = []; }, 1800);
    }
  }

  h.draw = function(ctx) {
    if(h.broken) return;
    
    
    var px=h.x,py=h.y,sz=env.TILE*0.88;

    ctx.save();
    ctx.translate(px, py);
    env.drawSpr(ctx, 'cage_back', 0, 0, sz);

    if (!h.freed && h.fairyAnim) {
      h.fairyAnim.force_show = ['head_' + h.fairyId];
      h.fairyAnim.force_hide = ['head_a', 'head_b', 'head_c', 'glow'];
      h.fairyAnim.force_hide.splice(h.fairyAnim.force_hide.indexOf(h.fairyAnim.force_show[0]), 1);
      h.fairyAnim.draw(ctx, 0, -16, 0.2);
    }

    env.drawSpr(ctx, 'cage_front', 0, 0, sz);
    if (!h.freed) env.drawSpr(ctx, 'cage_' + h.fairyId ,0,0,sz);
    ctx.restore();

    if(!h.freed&&env.player){
        
      var hk=env.player.fairyKeys[h.fairyId];
      
      env.drawInteractHint(h.c, h.r, px, py-sz/2-26, hk ? '[E / Space - открыть]' : '[нужен ' + IDEFS['key_' + h.fairyId].name + ']');
    }
  };
}
