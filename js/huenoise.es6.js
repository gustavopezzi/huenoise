let configs = {
    backgroundColor: '#121212',
    particleNum: 1000,
    step: 5,
    base: 2000,
    zInc: 0.001
};

class HSLA {
    constructor(h, s, l, a) {
        this.h = h || 0;
        this.s = s || 0;
        this.l = l || 0;
        this.a = a || 0;
    }

    toString() {
        return 'hsla(' + this.h + ', ' + (this.s * 100) + '%, ' + (this.l * 100) + '%, ' + this.a + ')';
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x || 0;
        this.y = y || 0;
        this.color = color || new HSLA();
        this.pastX = this.x;
        this.pastY = this.y;
    }
}

let canvas;
let context;
let screenWidth, screenHeight;
let centerX, centerY;
let particles = [];
let hueBase = 0;
let simplexNoise;
let zoff = 0;

function init() {
    canvas = document.getElementById('main-canvas');

    screenWidth  = canvas.width  = window.innerWidth;
    screenHeight = canvas.height = window.innerHeight;

    centerX = screenWidth / 2;
    centerY = screenHeight / 2;

    context = canvas.getContext('2d');
    context.lineWidth = 0.5;
    context.lineCap = context.lineJoin = 'round';

    let len = configs.particleNum;

    for (let i = 0; i < len; i++) {
        initParticle((particles[i] = new Particle()));
    }

    simplexNoise = new SimplexNoise();

    update();
}

function getNoise(x, y, z) {
    let octaves = 4;
    let fallout = 0.5;
    let amp = 1, f = 1, sum = 0;

    for (let i = 0; i < octaves; i++) {
        amp *= fallout;
        sum += amp * (simplexNoise.noise3D(x * f, y * f, z * f) + 1) * 0.5;
        f *= 2;
    }

    return sum;
}

function initParticle(p) {
    p.x = p.pastX = screenWidth * Math.random();
    p.y = p.pastY = screenHeight * Math.random();
    p.color.h = hueBase + Math.atan2(centerY - p.y, centerX - p.x) * 180 / Math.PI;
    p.color.s = 1;
    p.color.l = 0.5;
    p.color.a = 0;
}

function update() {
    let step = configs.step;
    let base = configs.base;
    let len = particles.length;

    for (let i = 0; i < len; i++) {
        let p = particles[i];

        p.pastX = p.x;
        p.pastY = p.y;

        let angle = Math.PI * 6 * getNoise(p.x / base * 1.75, p.y / base * 1.75, zoff);
        p.x += Math.cos(angle) * step;
        p.y += Math.sin(angle) * step;

        if (p.color.a < 1) {
            p.color.a += 0.003;
        }

        context.beginPath();
        context.strokeStyle = p.color.toString();
        context.moveTo(p.pastX, p.pastY);
        context.lineTo(p.x, p.y);
        context.stroke();

        if (p.x < 0 || p.x > screenWidth || p.y < 0 || p.y > screenHeight) {
            initParticle(p);
        }
    }

    hueBase += 0.1;
    zoff += configs.zInc;

    requestAnimationFrame(update);
}

window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

document.addEventListener("DOMContentLoaded", function(event) {
    init();
});