var canvas = null;
var ctx  = null;
var x = 50, y = 50;
var lastPress = null;
var KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    KEY_ENTER = 13;
var dir = 0;
var pause = true;
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

function Rectangle (x ,y , width, height){
    this.x = (x == null) ? 0 : x;
    this.y = (y == null) ? 0 : y;
    this.width = (width == null) ? 0 : width;
    this.height = (height == null) ? this.width : height;

    this.intersect = function(rect){

    }
}

function paint(ctx){
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = '#0f0';
    ctx.fillRect(x,y,10,10);

    ctx.fillStyle = '#fff'
    ctx.fillText('Last Press: ' + lastPress, 0, 20);

    if(pause){
        ctx.textAlign = 'center';
        ctx.fillText('PAUSE', 150, 75);
        ctx.textAlign = 'left';
    }
}

function act(){
    if(!pause){
        //Change Direction
        if(lastPress === KEY_UP) {
            dir = 0;
        }
        if(lastPress === KEY_RIGHT) {
            dir = 1;
        }
        if(lastPress === KEY_DOWN) {
            dir = 2;
        }
        if(lastPress === KEY_LEFT) {
            dir = 3;
        }

        //Move Rect
        if(dir === 0){
            y -= 10;
        }
        if(dir === 1){
            x += 10;
        }
        if(dir === 2){
            y += 10;
        }
        if(dir === 3){
            x -= 10;
        }

        //Out Screen
        if(x >= canvas.width){
            x = 0;
        }
        if(y >= canvas.height){
            y = 0;
        }
        if(x < 0){
            x = canvas.width;
        }
        if(y < 0){
            y = canvas.height;
        }
    }
    if(lastPress === KEY_ENTER){
        pause = !pause;
        lastPress = null;
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

