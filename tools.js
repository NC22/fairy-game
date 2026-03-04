// ---- Helpers ----
function rand(a, b) {
    return a + Math.random() * (b - a);
}

function randi(a, b) {
    return Math.floor(rand(a, b + 1));
}


function getCanvasPoint(canvas, ex, ey) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (ex - rect.left) * (canvas.width / rect.width),
        y: (ey - rect.top) * (canvas.height / rect.height)
    };
}

function mdist(c1, r1, c2, r2) {
    return Math.abs(c1 - c2) + Math.abs(r1 - r2);
}

function shuffleArr(a) {
    for (var i = a.length - 1; i > 0; i--) {
        var j = randi(0, i);
        var t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
    return a;
}