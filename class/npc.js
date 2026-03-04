function NpcEntity(env) {
  var h = this;

  h.make = function(id, c, r) {
      
    var tpl = NPC_TMPL.find(function(t){return t.id===id;}) || NPC_TMPL[0];
    
        h.isNpc=true;
        h.npcId=id;
        h.name=tpl.name;
        h.color=tpl.color;
        h.spriteKey= tpl.spriteKey || 'mentor';
        h.x=c*env.TILE+env.TILE/2, 
        h.y=r*env.TILE+env.TILE/2;
        h.c=c;
        h.r=r;
        h.hopTimer=rand(0,10), 
        h.hopSpeed=2;
        h.blocking=tpl.blocking;
        h.talkRadius=1;
        
        return h;
  };

  h.draw = function(ctx, e) {
      
    var bob = Math.sin(e.hopTimer * 0.7) * 2.5;
    var px=e.x, py=e.y+bob;
    var sz=env.TILE*0.82, half=sz/2;
    var grd=ctx.createRadialGradient(px,py,4,px,py,28);
    
    grd.addColorStop(0,'rgba(100,160,255,0.18)');
    grd.addColorStop(1,'transparent');
    ctx.fillStyle=grd;
    ctx.beginPath();ctx.arc(px,py,28,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(px,py);
    env.drawSpr(ctx, e.spriteKey, 0, 0, sz);
    ctx.restore();
    ctx.fillStyle='#6688cc';
    ctx.font='bold 7px Courier New';
    ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText(e.name, px, py - half - 32);
    
    env.drawInteractHint(e.c, e.r, px, py - half - 32 - 16);
  };
}
