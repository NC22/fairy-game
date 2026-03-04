
var DEFAULT_EASING = 'easeInOutCubic';

// ── easing helpers ──────────────────────────────────────────────────────────

function easeNone(t)      { return t; }

function easeInQuad(t)    { return t*t; }

function easeOutQuad(t)   { return t*(2-t); }

function easeInOutQuad(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t; }

function easeInCubic(t)   { return t*t*t; }

function easeOutCubic(t)  { var u=1-t; return 1-u*u*u; }

function easeInOutCubic(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

function easeInBack(t)    { var c=1.70158; return t*t*((c+1)*t-c); }

function easeOutBack(t)   { var c=1.70158,u=t-1; return u*u*((c+1)*u+c)+1; }

function easeOutElastic(t){
    if(t===0||t===1) return t;
    return Math.pow(2,-10*t)*Math.sin((t*10-0.75)*(2*Math.PI)/3)+1;
}

function easeOutBounce(t) {
    var n=7.5625, d=2.75;
    if(t<1/d)           return n*t*t;
    else if(t<2/d)      return n*(t-=1.5/d)*t+0.75;
    else if(t<2.5/d)    return n*(t-=2.25/d)*t+0.9375;
    else                return n*(t-=2.625/d)*t+0.984375;
}

function easeStep(t) { return t<1 ? 0 : 1; }

var EASINGS = {
    'linear'        : easeNone,
    'easeInQuad'    : easeInQuad,
    'easeOutQuad'   : easeOutQuad,
    'easeInOutQuad' : easeInOutQuad,
    'easeInCubic'   : easeInCubic,
    'easeOutCubic'  : easeOutCubic,
    'easeInOutCubic': easeInOutCubic,
    'easeInBack'    : easeInBack,
    'easeOutBack'   : easeOutBack,
    'easeOutElastic': easeOutElastic,
    'easeOutBounce' : easeOutBounce,
    'step'          : easeStep,
};


function lerpEased(a, b, t, easingName) {
    var fn = EASINGS[easingName || DEFAULT_EASING] || easeNone;
    return a + (b-a) * fn(t);
}

function lerpAngleEased(a, b, t, easingName) {
    var d = b-a;
    while(d >  180) d -= 360;
    while(d < -180) d += 360;
    var fn = EASINGS[easingName || DEFAULT_EASING] || easeNone;
    return a + d * fn(t);
}