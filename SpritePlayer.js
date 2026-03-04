function SpritePlayer(project, startAnim, images)
{
    var p = {};
    var currentAnim = startAnim;
    var frame = 0.0;
    var playing = true;
    var looping = true;
    var onAnimComplete = null;

    // Force visibility overrides: arrays of part IDs
    // force_hide: these parts are always hidden regardless of keyframe state
    // force_show: these parts are always shown regardless of keyframe state
    p.force_hide = [];
    p.force_show = [];

    function anim() { return project.anims[currentAnim]; }

    function keyframes(part) {
        return Object.keys(part.keys||{}).map(Number).sort(function(a,b){return a-b;});
    }

    function localStateAt(part, f) {
    
        var kf = part.keys || {};
        var frames = keyframes(part);
        
        if (!frames.length) return {x:0,y:0,rot:0,sx:1,sy:1,hidden:false,z:0};
        
        // exact keyframe must win (important for step-like props such as hidden/z)
        
        if (kf[f]) return Object.assign({}, kf[f]);
        
        if (frames.length===1||f<=frames[0]) return Object.assign({},kf[frames[0]]);
        
        if (f>=frames[frames.length-1]) return Object.assign({},kf[frames[frames.length-1]]);
        
        var lo,hi;
        
        for (var i=0;i<frames.length-1;i++) {
        
            if(frames[i]<=f && frames[i+1]>=f) {
                lo=frames[i];
                hi=frames[i+1];
                break;
            }
        }
        var t=(f-lo)/(hi-lo), a=kf[lo], b=kf[hi];
        
        var eas = a.easing || DEFAULT_EASING;
        
        return { 
            x : lerpEased(a.x, b.x, t, eas), 
            y : lerpEased(a.y, b.y, t, eas),
            rot : lerpAngleEased(a.rot, b.rot, t, eas), 
            sx : lerpEased(a.sx, b.sx, t, eas), 
            sy :lerpEased(a.sy, b.sy, t, eas),
            hidden : a.hidden, 
            z : a.z 
        };
    }

    function getPart(id) {
        if (!anim()) return null;
        for (var i=0;i<anim().parts.length;i++) if(anim().parts[i].id===id) return anim().parts[i];
        return null;
    }

    function worldStateAt(part, f) {
        var local = localStateAt(part, f);
        if (!part.parent) return local;
        var parentPart = getPart(part.parent);
        if (!parentPart) return local;
        var pw = worldStateAt(parentPart, f);
        if (pw.hidden) { var r=Object.assign({},local); r.hidden=true; return r; }
        var prad = pw.rot*Math.PI/180;
        var cos=Math.cos(prad), sin=Math.sin(prad);
        return {
            x: pw.x + (local.x*pw.sx)*cos - (local.y*pw.sy)*sin,
            y: pw.y + (local.x*pw.sx)*sin + (local.y*pw.sy)*cos,
            rot: pw.rot+local.rot, sx:pw.sx*local.sx, sy:pw.sy*local.sy,
            hidden:local.hidden, z:local.z
        };
    }

    p.setAnim = function(name, opts) {
        opts = opts || {};
        var changed = currentAnim !== name;
        if (changed) {
            currentAnim = name;
            frame = 0;
        }
        looping = opts.loop !== false;
        onAnimComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
        if (opts.restart === true) frame = 0;
        playing = true;
    };

    p.playOnce = function(name, fallbackAnim) {
        p.setAnim(name, {
            loop: false,
            restart: true,
            onComplete: function() {
                if (fallbackAnim) p.setAnim(fallbackAnim);
            }
        });
    };

    p.update = function(dt) {
        if (!anim() || !playing) return;
        frame += anim().fps * dt;

        if (frame >= anim().duration) {
            if (looping) {
                frame = frame % anim().duration;
            } else {
                frame = Math.max(0, anim().duration - 0.0001);
                playing = false;
                var cb = onAnimComplete;
                onAnimComplete = null;
                if (cb) cb();
            }
        }
    };

    p.draw = function(ctx, cx, cy, scale) {
        if (!anim()) return;
        scale = scale || 1;
        var f = Math.floor(frame);
        var parts = anim().parts.slice().sort(function(a,b){
            return worldStateAt(a,f).z - worldStateAt(b,f).z;
        });
        for (var i=0;i<parts.length;i++) {
            var part=parts[i];
            var s=worldStateAt(part,f);

            // Apply force_hide / force_show overrides
            var forceHidden = p.force_hide.indexOf(part.name) !== -1;
            var forceShown  = p.force_show.indexOf(part.name) !== -1;
            if (forceHidden) continue;
            if (!forceShown && s.hidden) {
                continue;
            }

            var img=images[part.id];
            if(!img) continue;
            ctx.save();
            ctx.translate(cx+s.x*scale, cy+s.y*scale);
            ctx.rotate(s.rot*Math.PI/180);
            ctx.scale(s.sx*scale, s.sy*scale);
            ctx.drawImage(img,-img.width/2,-img.height/2);
            ctx.restore();
        }
    };

    p.getFrame = function() { return Math.floor(frame); };
    p.setFrame = function(f) { frame=f; };
    p.pause    = function() { playing=false; };
    p.resume   = function() { playing=true; };
    p.getAnim   = function() { return currentAnim; };
    p.getImages   = function() { return images; };
    p.isPlaying = function() { return playing; };

    return p;
}


SpritePlayer.importJSONAnim = function(data, onLoad) {
    
    if (!data) {
        onLoad(null);
        return;
    }

    var project = data;
    var images  = {};

    var names = Object.keys(project.anims);
    var partIds = Object.keys(project.partBank || {});
    var pending = 0;
    
    function onFin() {
        
        onLoad({project : project, images : images});
    }

    function tryDone() {
        if (--pending === 0) onFin();
    }

    for (var pi = 0; pi < partIds.length; pi++) {
        var id = partIds[pi];
        var src = project.partBank[id];
        if (!src) continue;
        pending++;
        (function(partId, srcVal) {
            var img = new Image();
            img.onload = function() { images[partId] = img; tryDone(); };
            img.onerror = function() { tryDone(); };
            img.src = srcVal;
        })(id, src);
    }

    if (pending === 0) onFin();
}