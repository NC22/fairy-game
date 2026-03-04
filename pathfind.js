// ---- MinHeap ----
function MinHeap() {
    var h = this;
    h.data = [];
    h.push = function(x) {
        h.data.push(x);
        h._up(h.data.length - 1);
    };
    h.pop = function() {
        var top = h.data[0],
            last = h.data.pop();
        if (h.data.length) {
            h.data[0] = last;
            h._dn(0);
        }
        return top;
    };
    h.size = function() {
        return h.data.length;
    };
    h._up = function(i) {
        while (i > 0) {
            var p = (i - 1) >> 1;
            if (h.data[p].f <= h.data[i].f) break;
            var t = h.data[p];
            h.data[p] = h.data[i];
            h.data[i] = t;
            i = p;
        }
    };
    h._dn = function(i) {
        var n = h.data.length;
        for (;;) {
            var l = 2 * i + 1,
                r = 2 * i + 2,
                s = i;
            if (l < n && h.data[l].f < h.data[s].f) s = l;
            if (r < n && h.data[r].f < h.data[s].f) s = r;
            if (s === i) break;
            var t = h.data[s];
            h.data[s] = h.data[i];
            h.data[i] = t;
            i = s;
        }
    };
}

function PathFinder(env) {
    
    var h = this;
        h.env = env;
    
    h.find = function(sc, sr, gc, gr) {
        if (h.env.isWall(gc, gr))
            return [];

        if (sc === gc && sr === gr) return [];

        var W = h.env.cfg.mapW,
            H = h.env.cfg.mapH,
            D = [{
                c: 0,
                r: -1
            }, {
                c: 0,
                r: 1
            }, {
                c: -1,
                r: 0
            }, {
                c: 1,
                r: 0
            }];
        var g = new Float32Array(W * H);
        g.fill(Infinity);
        var cl = new Uint8Array(W * H);
        var pC = new Int16Array(W * H);
        pC.fill(-1);
        var pR = new Int16Array(W * H);
        g[sr * W + sc] = 0;
        var heap = new MinHeap();
        heap.push({
            c: sc,
            r: sr,
            f: Math.abs(gc - sc) + Math.abs(gr - sr)
        });
        var it = 0;
        while (heap.size() > 0 && it++ < 1000) {
            var cur = heap.pop(),
                ci = cur.r * W + cur.c;
            if (cl[ci]) continue;
            cl[ci] = 1;
            if (cur.c === gc && cur.r === gr) {
                var path = [],
                    cc = gc,
                    rr = gr;
                while (!(cc === sc && rr === sr)) {
                    path.push({
                        c: cc,
                        r: rr
                    });
                    var idx = rr * W + cc;
                    var nc = pC[idx];
                    rr = pR[idx];
                    cc = nc;
                }
                return path.reverse();
            }
            var cg = g[ci];
            for (var d = 0; d < 4; d++) {
                var nc2 = cur.c + D[d].c,
                    nr2 = cur.r + D[d].r;
                if (h.env.isWall(nc2, nr2)) continue;
                var ni = nr2 * W + nc2;
                if (cl[ni]) continue;
                var ng = cg + 1;
                if (ng < g[ni]) {
                    g[ni] = ng;
                    pC[ni] = cur.c;
                    pR[ni] = cur.r;
                    heap.push({
                        c: nc2,
                        r: nr2,
                        f: ng + Math.abs(gc - nc2) + Math.abs(gr - nr2)
                    });
                }
            }
        }
        return [];
    }
    
}