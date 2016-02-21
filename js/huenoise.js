'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var configs = {
    backgroundColor: '#121212',
    particleNum: 1000,
    step: 5,
    base: 2000,
    zInc: 0.001
};

var HSLA = function () {
    function HSLA(h, s, l, a) {
        _classCallCheck(this, HSLA);

        this.h = h || 0;
        this.s = s || 0;
        this.l = l || 0;
        this.a = a || 0;
    }

    _createClass(HSLA, [{
        key: 'toString',
        value: function toString() {
            return 'hsla(' + this.h + ', ' + this.s * 100 + '%, ' + this.l * 100 + '%, ' + this.a + ')';
        }
    }]);

    return HSLA;
}();

var Particle = function Particle(x, y, color) {
    _classCallCheck(this, Particle);

    this.x = x || 0;
    this.y = y || 0;
    this.color = color || new HSLA();
    this.pastX = this.x;
    this.pastY = this.y;
};

var canvas = undefined;
var context = undefined;
var screenWidth = undefined,
    screenHeight = undefined;
var centerX = undefined,
    centerY = undefined;
var particles = [];
var hueBase = 0;
var simplexNoise = undefined;
var zoff = 0;

function init() {
    canvas = document.getElementById('main-canvas');

    screenWidth = canvas.width = window.innerWidth;
    screenHeight = canvas.height = window.innerHeight;

    centerX = screenWidth / 2;
    centerY = screenHeight / 2;

    context = canvas.getContext('2d');
    context.lineWidth = 0.5;
    context.lineCap = context.lineJoin = 'round';

    var len = configs.particleNum;

    for (var i = 0; i < len; i++) {
        initParticle(particles[i] = new Particle());
    }

    simplexNoise = new SimplexNoise();

    update();
}

function getNoise(x, y, z) {
    var octaves = 4;
    var fallout = 0.5;
    var amp = 1,
        f = 1,
        sum = 0;

    for (var i = 0; i < octaves; i++) {
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
    var step = configs.step;
    var base = configs.base;
    var len = particles.length;

    for (var i = 0; i < len; i++) {
        var p = particles[i];

        p.pastX = p.x;
        p.pastY = p.y;

        var angle = Math.PI * 6 * getNoise(p.x / base * 1.75, p.y / base * 1.75, zoff);
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

window.requestAnimationFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
}();

document.addEventListener("DOMContentLoaded", function (event) {
    init();
});
