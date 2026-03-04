
// ============================================================
//  NPC DIALOGUE SYSTEM
// ============================================================
function DialogueSystem(env) {
  var ds = this;
  var env =  env;
  // Active dialogue state
  ds.active    = false;
  ds.npc       = null;      // reference to NPC entity
  ds.script    = [];        // array of dialogue nodes
  ds.nodeIdx   = 0;
  ds.charIdx   = 0;         // for typewriter effect
  ds.charTimer = 0;
  ds.CHAR_SPEED = 0.032;    // seconds per character
  ds.choiceIdx = 0;         // selected choice
  ds.finished  = false;     // typewriter done

  ds.start = function(npc, script, startIdx) {
    ds.active    = true;
    ds.npc       = npc;
    ds.script    = script;
    ds.nodeIdx   = (startIdx !== undefined && startIdx !== null) ? startIdx : 0;
    ds.charIdx   = 0;
    ds.charTimer = 0;
    ds.choiceIdx = 0;
    ds.finished  = false;
  };

  ds.close = function() {
    ds.active  = false;
    console.log(ds.npc);
    if (ds.npc && ds.npc.blocking) ds.npc.blocking = 0;
    
    ds.npc     = null;
    ds.script  = [];
  };

  ds.currentNode = function() {
      
    for (var i = 0; i < ds.script.length; i++) {

        if (ds.script[i].idx == ds.nodeIdx) return ds.script[i];
    }
      
    return null;
  };

  ds.update = function(dt) {
    if (!ds.active) return;
    var node = ds.currentNode();
    if (!node || node.choices) return; // choices don't typewrite
    if (!ds.finished) {
      ds.charTimer += dt;
      var charsToAdd = Math.floor(ds.charTimer / ds.CHAR_SPEED);
      if (charsToAdd > 0) {
        ds.charIdx = Math.min(ds.charIdx + charsToAdd, node.text.length);
        ds.charTimer -= charsToAdd * ds.CHAR_SPEED;
        if (ds.charIdx >= node.text.length) ds.finished = true;
      }
    }
  };

  // Returns true if consumed
  ds.onConfirm = function() {
    if (!ds.active) return false;
    var node = ds.currentNode();
    
    
    if (!node) { ds.close(); return true; }

    if (!ds.finished && !node.choices) {
      // skip typewriter
      ds.charIdx = node.text.length;
      ds.finished = true;
      return true;
    }

    if (node.choices) {
      var choices = ds.getChoices(node);
      if (!choices.length) { ds.close(); return true; }
      // activate chosen option
      var choice = choices[Math.max(0, Math.min(ds.choiceIdx, choices.length - 1))];
      var nextOverride;
      if (choice.action) nextOverride = choice.action(env, ds, node, choice);
      var nextIdx = (nextOverride !== undefined) ? nextOverride : choice.next;
      if (nextIdx !== undefined) {
        ds.nodeIdx   = nextIdx;
        ds.charIdx   = 0;
        ds.charTimer = 0;
        ds.choiceIdx = 0;
        ds.finished  = false;
      } else {
        ds.close();
      }
      return true;
    }

    // advance to next node
    if (node.next !== null && node.next !== -1) {
      ds.nodeIdx   = node.next;
      ds.charIdx   = 0;
      ds.charTimer = 0;
      ds.choiceIdx = 0;
      ds.finished  = false;
    } else {
      ds.close();
    }
    return true;
  };

  ds.onUp = function() {
    if (!ds.active) return false;
    var node = ds.currentNode();
    var choices = node && node.choices ? ds.getChoices(node) : null;
    if (choices && choices.length) {
      ds.choiceIdx = (ds.choiceIdx - 1 + choices.length) % choices.length;
      return true;
    }
    return false;
  };

  ds.onDown = function() {
    if (!ds.active) return false;
    var node = ds.currentNode();
    var choices = node && node.choices ? ds.getChoices(node) : null;
    if (choices && choices.length) {
      ds.choiceIdx = (ds.choiceIdx + 1) % choices.length;
      return true;
    }
    return false;
  };

  ds.getChoices = function(node) {
    if (!node || !node.choices) return [];
    return node.choices.filter(function(choice) {
      if (!choice.condition) return true;
      return !!choice.condition(env, ds, node, choice);
    });
  };

  // ---- Draw the dialogue box ----
  ds.draw = function(ctx, W, H) {
    if (!ds.active) return;
    var node = ds.currentNode();
    if (!node) return;

    var BOX_H   = 130;
    var BOX_PAD = 14;
    var AVATAR_SZ = 100;
    var bx = 20, by = H - BOX_H - 20, bw = W - 40;

    // semi-transparent BG
    ctx.fillStyle = 'rgba(4,4,10,0.92)';
    ctx.fillRect(bx, by, bw, BOX_H);
    ctx.strokeStyle = node.speakerColor || '#8899cc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, BOX_H - 1);
    // inner top line
    ctx.strokeStyle = (node.speakerColor || '#8899cc') + '55';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx + AVATAR_SZ + BOX_PAD*2, by + 30);
                     ctx.lineTo(bx + bw - BOX_PAD, by + 30);
    ctx.stroke();

    // Avatar box
    var avX = bx + BOX_PAD, avY = by + (BOX_H - AVATAR_SZ) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(avX, avY, AVATAR_SZ, AVATAR_SZ);
    ctx.strokeStyle = node.speakerColor || '#8899cc';
    ctx.lineWidth = 1;
    ctx.strokeRect(avX, avY, AVATAR_SZ, AVATAR_SZ);

    // Avatar image or emoji
    var avatarKey = 'avatar_' + node.avatar;
    
    var spr = SPRITES[avatarKey];
    if (spr && spr.img) {
      ctx.save();
      ctx.beginPath(); ctx.rect(avX+2, avY+2, AVATAR_SZ-4, AVATAR_SZ-4); ctx.clip();
      var sc = (AVATAR_SZ - 4) / (AVATAR_SZ);
      var iw = env.TILE * spr.scale;
      ctx.drawImage(spr.img, avX + 2 + (AVATAR_SZ-4)/2 - iw/2 + spr.ox, avY + 2 + (AVATAR_SZ-4)/2 - iw/2 + spr.oy, iw, iw);
      ctx.restore();
    }

    // Speaker name
    var npcTpl = env.getNPCTpl(node.speaker);
    var npcName = npcTpl ? npcTpl.name : '???';
    var tx = avX + AVATAR_SZ + BOX_PAD;
    ctx.fillStyle = node.speakerColor || '#c8d8ff';
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(npcName, tx, by + 10);

    // Dialogue text (typewriter)
    if (!node.choices) {
      var visText = node.text.substring(0, ds.charIdx);
      ctx.fillStyle = '#dde8ff';
      ctx.font = '14px Courier New';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      // word wrap
      wrapText(ctx, visText, tx, by + 36, bw - AVATAR_SZ - BOX_PAD*3, 16);

      // continue prompt
      if (ds.finished) {
        var pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.006);
        ctx.globalAlpha = 0.4 + 0.6 * pulse;
        ctx.fillStyle = '#aabbdd';
        ctx.font = '8px Courier New';
        ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillText('[Enter / E]', bx + bw - BOX_PAD, by + BOX_H - 8);
        ctx.globalAlpha = 1;
      }
    } else {
      // Choices
      ctx.fillStyle = '#aabbcc';
      ctx.font = '12px Courier New';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(node.text || 'Что ответить?', tx, by + 36);
      var choices = ds.getChoices(node);
      if (ds.choiceIdx >= choices.length) ds.choiceIdx = 0;
      for (var ci = 0; ci < choices.length; ci++) {
        var sel = ci === ds.choiceIdx;
        var cy2 = by + 56 + ci * 18;
        if (sel) {
          ctx.fillStyle = 'rgba(100,120,200,0.22)';
          ctx.fillRect(tx - 2, cy2 - 2, bw - AVATAR_SZ - BOX_PAD*2, 16);
          ctx.fillStyle = '#ffee88';
        } else {
          ctx.fillStyle = '#8899bb';
        }
        ctx.font = (sel ? 'bold ' : '') + '12px Courier New';
        ctx.fillText((sel ? '▶ ' : '  ') + choices[ci].text, tx, cy2);
      }
      ctx.fillStyle = '#445566';
      ctx.font = '8px Courier New';
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText('[↑↓ выбор / Enter]', bx + bw - BOX_PAD, by + BOX_H - 8);
    }
  };

  function wrapText(ctx, text, x, y, maxW, lineH) {
    var words = text.split(' ');
    var line = '';
    var lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line + (line ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    for (var l = 0; l < Math.min(lines.length, 4); l++) {
      ctx.fillText(lines[l], x, y + l * lineH);
    }
  }
}
