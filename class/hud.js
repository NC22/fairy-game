
// ============================================================
//  HUD & UI CLASS
// ============================================================
function GameUI(env, ctx, canvas) {

  var ui = this;
  var pauseMenuIdx = 0;
  var font = 'monospace';

  // ---- Generic UI helpers ----
  function uiBox(x, y, w, h, borderColor) {
    ctx.fillStyle = 'rgba(5,5,8,0.93)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = borderColor || '#666'; ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  function uiBtn(x, y, w, h, label, action, col, textCol, focused) {
    env.canvasButtons.push({x:x, y:y, w:w, h:h, label:label, action:action});
    ctx.fillStyle = col || 'rgba(30,28,18,0.9)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = focused ? '#ffee88' : '#555';
    ctx.lineWidth = focused ? 2 : 1;
    ctx.strokeRect(x+0.5, y+0.5, w-1, h-1);
    ctx.fillStyle = textCol || '#c8b870'; ctx.font = '11px ' + font + '';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w/2, y + h/2);
  }

  function drawModalOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
   ui.update = function(dt) {
    if (env.modal==='mainmenu') {
         env.FAIRY_TPL.animController.update(dt);
    }
  };
  
  // ---- MAIN MENU ----
  ui.drawMainMenu = function(menuIdx) {
    var W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#0a0a08'; ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#e8d060'; ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Феечки и Подземелья', W/2, H/2 - 80);
    ctx.fillStyle = '#fff'; ctx.font = '14px ' + font + '';
    ctx.fillText('Освободи всех фей', W/2, H/2 - 52);

  

    var items = ['НОВАЯ ИГРА', 'УПРАВЛЕНИЕ'];
    var bw = 200, bh = 32;
    for (var i = 0; i < items.length; i++) {
      var sel = i === menuIdx;
      var mx = W/2 - bw/2;
      var my = H/2 - 10 + i * 44;
      ctx.fillStyle = sel ? 'rgba(60,54,20,0.95)' : 'rgba(15,14,8,0.9)';
      ctx.fillRect(mx, my, bw, bh);
      ctx.strokeStyle = sel ? '#c8b870' : '#333';
      ctx.lineWidth = 1; ctx.strokeRect(mx, my, bw, bh);
      ctx.fillStyle = sel ? '#ffee88' : '#777';
      ctx.font = (sel ? 'bold ' : '') + '12px ' + font + '';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText((sel ? '▶ ' : '  ') + items[i], W/2, my + bh/2);
    }

    ctx.fillStyle = '#fff'; ctx.font = '12px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('[↑↓ выбор  E начать]', W/2, H - 32);
    ctx.fillStyle = '#d8d8d8'; ctx.font = '12px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('nradiowave © 2026', W/2, H - 8);
    
    var t = Date.now() * 0.001;
    for (var fi = 0; fi < 1; fi++) {
        
      var fx = W - 100 + Math.cos(t * 0.8 + fi * 2.1) * 10 ;
      var fy = H/2 - 68 + Math.sin(t * 1.1 + fi * 2.1) * 18;
      
        var ac = env.FAIRY_TPL.animController;
        if (ac) {
            ctx.save();

            ac.draw(ctx, fx, fy, 0.6);
            ctx.restore();
        }

    }
  };

  // ---- CONTROLS SCREEN ----
  ui.drawControls = function() {
    var W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#0a0a08'; ctx.fillRect(0, 0, W, H);

    var bw = 360, bh = 280;
    var bx = W/2 - bw/2, by = H/2 - bh/2;
    uiBox(bx, by, bw, bh, '#8899cc');
    ctx.fillStyle = '#e8d060'; ctx.font = 'bold 11px ' + font + '';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('УПРАВЛЕНИЕ', bx + bw/2, by + 14);

    var lines = [
      ['WASD / ←↑↓→', 'Движение / прицел лука'],
      ['E / Space', 'Атака / Взаимодействие / Выстрел'],
      ['F', 'Режим прицела лука / выстрел посохом'],
      ['I', 'Инвентарь'],
      ['1/2/3', 'Быстрая смена: меч/лук/посох'],
      ['4', 'Быстро выпить зелье лечения'],
      ['Esc', 'Пауза / отмена прицела'],
      ['', ''],
      ['Лук и Посох', 'E - быстрая атака'],
      [' ', 'F - вход в режим прицела'],
    ];

    ctx.font = '11px ' + font + ''; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    for (var i = 0; i < lines.length; i++) {
      var ly = by + 34 + i * 22;
      if (!lines[i][0]) continue;
      ctx.fillStyle = '#c8b870';
      ctx.fillText(lines[i][0], bx + 10, ly);
      ctx.fillStyle = '#fff';
      ctx.fillText(lines[i][1], bx + 130, ly);
    }

    ctx.fillStyle = '#fff'; ctx.font = '12px ' + font + '';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('[Esc - назад]', bx + bw/2, by + bh - 6);
  };
  
  function drawHeader(title, bx, by, bw) {
      
    ctx.fillStyle = '#e8d060'; ctx.font = 'bold 11px ' + font + '';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(title.toUpperCase(), bx + bw/2, by + 11);
      
  }
  
  // ---- PAUSE MENU ----
  ui.drawPauseMenu = function(idx) {
    pauseMenuIdx = idx;
    var W = canvas.width, H = canvas.height;
    drawModalOverlay();
    var bw = 220, bh = 160;
    var bx = Math.floor(W/2 - bw/2), by = Math.floor(H/2 - bh/2);
    uiBox(bx, by, bw, bh, '#c8b870');

    drawHeader('Пауза', bx, by, bw);
    
    var items = ['ПРОДОЛЖИТЬ', 'НОВЫЙ ЭТАЖ', 'РЕСТАРТ', 'ГЛАВНОЕ МЕНЮ'];
    for (var i = 0; i < items.length; i++) {
      var sel = i === pauseMenuIdx;
      var iy = by + 30 + i * 30;
      if (sel) {
        ctx.fillStyle = 'rgba(60,54,20,0.8)';
        ctx.fillRect(bx + 12, iy - 2, bw - 24, 24);
        ctx.strokeStyle = '#c8b870'; ctx.lineWidth = 1;
        ctx.strokeRect(bx + 12, iy - 2, bw - 24, 24);
      }
      ctx.fillStyle = sel ? '#ffee88' : '#777';
      ctx.font = (sel ? 'bold ' : '') + '11px ' + font + '';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText((sel ? '▶ ' : '') + items[i], bx + bw/2, iy + 11);
    }
  };

  // ---- INVENTORY ----
  ui.drawInventory = function(page, floorNum) {
    env.canvasButtons = [];
    var W = canvas.width, H = canvas.height;
    var bw = Math.min(420, W - 30), bh = Math.min(360, H - 50);
    var bx = Math.floor(W/2 - bw/2), by = Math.floor(H/2 - bh/2);
    var pl = env.player;

    uiBox(bx, by, bw, bh, '#888');
    drawHeader('Инвентарь', bx, by, bw);

    var cx = bx + 12, cy = by + 30, lh = 17;

    var stats = [
      ['Уровень', pl.level, '#ffdd44'], ['HP', pl.hp + '/' + pl.maxHp, '#ff6666'],
      ['Атака', pl.atk, '#ffaa44'], ['Защита', pl.def, '#88aaff'],
      ['XP', pl.xp + '/' + pl.xpNext, '#88ff88'], ['Золото', pl.gold, '#ffcc44'],
      ['Стрелы', pl.arrows, '#d4a830'], ['Стамина', Math.floor(pl.stamina) + '/' + pl.maxStamina, '#e4cf55'],
      ['Мана', Math.floor(pl.mana||0) + '/' + (pl.maxMana||60), '#66aaff'], ['Очки', pl.statPoints || 0, '#e8d060'],
      ['Этаж', floorNum, '#888'],
    ];
    var col2 = bx + bw/2;
    for (var i = 0; i < stats.length; i++) {
      var s = stats[i]; var row = Math.floor(i/2), colX = i%2 === 0 ? cx : col2;
      var ry = cy + row * lh;
      ctx.fillStyle = '#444'; ctx.font = '12px ' + font + '';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(s[0] + ':', colX, ry);
      ctx.fillStyle = s[2]; ctx.fillText(s[1], colX + 70, ry);
    }

    var actionY = cy + Math.ceil(stats.length/2) * lh + 8 ;
    var nextBtn = 0;
    var focusedIdx = typeof env.invSelection === 'number' ? env.invSelection : 0;

    if ((pl.statPoints || 0) > 0) {
      ctx.fillStyle = '#c8b870'; ctx.font = '9px ' + font + '';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('Прокачка (' + pl.statPoints + '):', cx, actionY);
      var ups = [
        {lbl:'HP +2', fn:function(){if(pl.statPoints>0){pl.statPoints--;pl.maxHp+=2;pl.hp=Math.min(pl.maxHp,pl.hp+2);}}},
        {lbl:'АТК +1', fn:function(){if(pl.statPoints>0){pl.statPoints--;pl.atk+=1;}}},
        {lbl:'ЗАЩ +1', fn:function(){if(pl.statPoints>0){pl.statPoints--;pl.def+=1;}}},
        {lbl:'СТАМ +10', fn:function(){if(pl.statPoints>0){pl.statPoints--;pl.maxStamina+=10;pl.stamina=Math.min(pl.maxStamina,pl.stamina+10);}}},
        {lbl:'МАНА +10', fn:function(){if(pl.statPoints>0){pl.statPoints--;pl.maxMana=(pl.maxMana||60)+10;pl.mana=Math.min(pl.maxMana,(pl.mana||0)+10);}}}
      ];
      for (var uix = 0; uix < ups.length; uix++) {
        uiBtn(cx + uix * 60, actionY + 14, 58, 18, ups[uix].lbl, ups[uix].fn, 'rgba(40,36,10,0.98)', '#e8d060', focusedIdx === nextBtn);
        nextBtn++;
      }
      actionY += 40;
    }

    ctx.fillStyle = '#777'; ctx.font = '9px ' + font + '';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('СНАРЯЖЕНИЕ И ПРЕДМЕТЫ:', cx, actionY);
    actionY += 14;

    var allW = ['sword', 'bow', 'staff'];
    allW.forEach(function(w) {
      if (!pl.weapons.includes(w)) return;
      var selW = pl.weapon === w;
      var wnames = {sword:'Меч', bow:'Лук', staff:'Посох'};
      var extra = w === 'bow' ? ' (' + pl.arrows + ' стрел)' : '';
      uiBtn(cx, actionY, bw - 24, 22, wnames[w] + extra,
        (function(ww){ return function(){
          env.player.equipWeapon(w);
        }; })(w),
        selW ? 'rgba(40,36,10,0.98)' : 'rgba(15,14,8,0.98)',
        selW ? '#e8d060' : '#aaa',
        focusedIdx === nextBtn);
      nextBtn++;
      actionY += 28;
    });

    var potions = pl.items.filter(function(it){ return it.kind === 'potion'; });
    if (potions.length > 0) {
      uiBtn(cx, actionY, bw - 24, 22, 'Зелье ×' + potions.length + ' — Выпить', function(){
        env.player.usePotion();
      }, 'rgba(15,14,8,0.98)', '#88ffaa', focusedIdx === nextBtn);
      nextBtn++;
      actionY += 28;
    }

    var kids = Object.keys(pl.fairyKeys).filter(function(k){ return pl.fairyKeys[k]; });
    if (kids.length > 0) {
      ctx.fillStyle='#555'; ctx.font='9px ' + font + '';
      ctx.textAlign='left'; ctx.textBaseline='top';
      ctx.fillText('КЛЮЧИ:', cx, actionY); actionY += lh;
      kids.forEach(function(kid){
        var def = CDEFS && CDEFS.find(function(d){ return d.id===kid; });
        ctx.fillStyle = def ? def.color : '#ffd';
        ctx.font = '9px ' + font + '';
        ctx.fillText((def ? def.label : kid) + ' ключ', cx, actionY); actionY += lh;
      });
    }

    if (env.canvasButtons.length === 0) {
      ctx.fillStyle='#444'; ctx.font='9px ' + font + '';
      ctx.textAlign='left'; ctx.textBaseline='top';
      ctx.fillText('Нет доступных действий', cx, actionY);
      env.invSelection = 0;
    } else {
      env.invSelection = Math.max(0, Math.min(env.canvasButtons.length - 1, focusedIdx));
    }

  };

  // ---- WIN/LOSE ----
  ui.drawWinLose = function(menuIdx, floorNum) {
    var W = canvas.width, H = canvas.height;
    drawModalOverlay();
    var win = env.modal === 'win';
    var bw = 300, bh = 155;
    var bx = Math.floor(W/2 - bw/2), by = Math.floor(H/2 - bh/2) + 60;
    uiBox(bx, by, bw, bh, win ? '#c8b870' : '#883333');
    var title = win ? 'ФЕИ ОСВОБОЖДЕНЫ' : 'GAME OVER';
    var sub = win ? ('Этаж пройден') : ('Фиалака осталась на этаже ' + floorNum + '...');
    ctx.fillStyle = win ? '#e8d060' : '#cc4444';
    ctx.font = 'bold 16px ' + font + ''; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(title, bx + bw/2, by + 22);
    ctx.fillStyle = '#888'; ctx.font = '10px ' + font + '';
    ctx.fillText(sub, bx + bw/2, by + 46);

    var menuItems = win ? ['▶ Следующий этаж'] : ['Рестарт', 'Главное меню'];

    for (var mi = 0; mi < menuItems.length; mi++) {
      var sel = menuIdx === mi;
      var mx = bx + bw/2 - (menuItems.length===1 ? 80 : 130) + mi * 140;
      var mw = menuItems.length===1 ? 160 : 120;
      var myy = by + 80;
      ctx.fillStyle = sel ? 'rgba(60,54,20,0.95)' : 'rgba(20,18,8,0.9)';
      ctx.fillRect(mx, myy, mw, 28);
      ctx.strokeStyle = sel ? '#c8b870' : '#444'; ctx.lineWidth = 1;
      ctx.strokeRect(mx, myy, mw, 28);
      ctx.fillStyle = sel ? '#ffee88' : (win ? '#88ffaa' : '#ff8888');
      ctx.font = (sel ? 'bold ' : '') + '10px ' + font + '';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(menuItems[mi], mx + mw/2, myy + 14);
    }
    env._winMenuItems = menuItems;
  };

  // ---- HUD ----
  ui.drawHUD = function(floorNum) {
    if (!env.player) return;
    var pl = env.player, W = canvas.width, H = canvas.height;
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, W, 28);
    ctx.strokeStyle = '#2a2a18'; ctx.lineWidth = 1; ctx.strokeRect(0, 27.5, W, 0);

    var sx = 20;
    function hudStat(icon, val, col) {
      ctx.fillStyle = '#444'; ctx.font = '9px ' + font + '';
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      if (icon.length > 0) {ctx.fillText(icon, sx, 14); sx += 20;} //todo - draw sprite
      ctx.fillStyle = col || '#c8b870'; ctx.font = '9px ' + font + '';
      ctx.fillText(String(val), sx, 14); sx += ctx.measureText(String(val)).width + 10;
    }

    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(sx, 7, 60, 10);
    var pct = pl.hp / pl.maxHp;
    ctx.fillStyle = pct > 0.5 ? '#3a9a3a' : pct > 0.25 ? '#9a7a20' : '#9a2020';
    ctx.fillRect(sx, 7, 60 * pct, 10);
    ctx.strokeStyle = '#444'; ctx.lineWidth = 0.5; ctx.strokeRect(sx, 7, 60, 10);
    ctx.fillStyle = '#aaa'; ctx.font = '8px ' + font + '';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(pl.hp + '/' + pl.maxHp, sx + 30, 12);

    sx += 68;
    hudStat('LV', pl.level, '#ffdd44');
    hudStat('ATK', pl.atk, '#ffaa44');
    hudStat('DEF', pl.def, '#88aaff');
    hudStat('XP', pl.xp + '/' + pl.xpNext, '#88cc88');
    hudStat('', 'Золото : ' + pl.gold, '#ffcc44');
    
    var wname = {sword:'Меч', bow:'Лук', staff:'Посох'}[pl.weapon] || pl.weapon;
    ctx.fillStyle = '#666'; ctx.font = '9px ' + font + '';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(wname, sx, 14); sx += ctx.measureText(wname).width + 8;
    if (pl.weapon === 'bow') { ctx.fillStyle = '#d4a830'; ctx.fillText('Стрел : ' + pl.arrows, sx, 14); sx += 40; }
    if (pl.weapon === 'staff') { ctx.fillStyle = '#4488cc'; ctx.fillText('Мана : ' + Math.floor(pl.mana||0) + '/' + (pl.maxMana||60), sx, 14); sx += 50; }

    ctx.fillStyle = '#333'; ctx.font = '8px ' + font + '';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Этаж ' + floorNum, W - 160, 14);

    // Fairy companions HUD icons
    var rescued = (env.globalState && env.globalState.rescuedFairies) ? env.globalState.rescuedFairies : {};
    var fy2 = 36;
    if (CDEFS) {
      CDEFS.forEach(function(def) {
        var done = rescued[def.id];
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(W - 160, fy2, 160, 14);
        ctx.fillStyle = done ? '#44cc88' : '#888';
        ctx.font = '14px ' + font + ''; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText((done ? '✓ ' : ' x '), W - 140, fy2 + 7);
        ctx.fillText(def.label, W - 4, fy2 + 7);
        fy2 += 16;
      });
    } 
  };
}
