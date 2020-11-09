var canvas = null;
var ctx  = null;
var x = 50, y = 50;
var lastPress = null;
var KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40;
var dir = 0;
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 17);
        };
}());

document.addEventListener('keydown',function(evt){
    lastPress = evt.which;
},false);

function paint(ctx){
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = '#0f0';
    ctx.fillRect(x,y,10,10);

    ctx.fillText('Last Press: ' + lastPress, 0, 20);
}

function act(){
    x += 2;
    if(x > canvas.width){
        x = 0;
    }
}

function repaint(){
    window.requestAnimationFrame(repaint);
    paint(ctx);
}

function run(){
    setTimeout(run, 50);
    act();
}

function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    run();
    repaint();
}

window.addEventListener('load',init,false);

