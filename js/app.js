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
var player = null;
var food = null;
var score = 0;
var wall = [];
var gameover = false;

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

    this.intersects = function(rect){
        if(rect == null){
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
        }
    };

    this.fill = function(ctx){
        if(ctx == null) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
}

function random(max) {
    return Math.floor(Math.random() * max);
}

function paint(ctx){
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //Draw Player
    ctx.fillStyle = '#0f0';
    player.fill(ctx);
    // ctx.fillRect(x,y,10,10);

    //Draw Food
    ctx.fillStyle = '#f00';
    food.fill(ctx);

    //Draw Walls
    ctx.fillStyle = '#999';
    for(var i = 0, l = wall.length; i < l; i++){
        wall[i].fill(ctx);
    }
    //Debug Lastpress
    ctx.fillStyle = '#fff'
    ctx.fillText('Last Press: ' + lastPress, 0, 20);

    //Draw score
    ctx.fillText('Score: ' + score, 0, 10);

    if(pause){
        ctx.textAlign = 'center';
        if(gameover){
            ctx.fillText('GAME OVER', 150, 75);
        } else {
            ctx.fillText('PAUSE', 150, 75);
        }
        ctx.textAlign = 'left';
    }
}

function act(){
    if(!pause){
        //Check game over
        if(gameover){
            reset();
        }

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
            player.y -= 10;
        }
        if(dir === 1){
            player.x += 10;
        }
        if(dir === 2){
            player.y += 10;
        }
        if(dir === 3){
            player.x -= 10;
        }

        //Out Screen
        if(player.x >= canvas.width){
            player.x = 0;
        }
        if(player.y >= canvas.height){
            player.y = 0;
        }
        if(player.x < 0){
            player.x = canvas.width;
        }
        if(player.y < 0){
            player.y = canvas.height;
        }

        //Food Intersects
        if (player.intersects(food)) {
            score += 1;
            food.x = random(canvas.width / 10 - 1 ) * 10
            food.y = random(canvas.height / 10 - 1 ) * 10
        }

        //Wall Intersects
        for(var i = 0, l = wall.length; i < l; i++){
            if(food.intersects(wall[i])){
                food.x = random(canvas.width / 10 - 1 ) * 10
                food.y = random(canvas.height / 10 - 1 ) * 10
            }
            if(player.intersects(wall[i])){
                gameover = true;
                pause = true;
            }
        }
    }
    if(lastPress === KEY_ENTER){
        pause = !pause;
        lastPress = null;
    }
}

function reset(){
    score = 0;
    dir = 1;
    player.x = 40;
    player.y = 40;
    food.x = random(canvas.width / 10 - 1 ) * 10;
    food.y = random(canvas.height / 10 - 1 ) * 10;
    gameover = false;
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
    player = new Rectangle(40, 40, 10, 10);
    food = new Rectangle(80, 80, 10, 10);
    wall.push(new Rectangle(100, 50, 10, 10))
    wall.push(new Rectangle(100, 100, 10, 10))
    wall.push(new Rectangle(200, 50, 10, 10))
    wall.push(new Rectangle(200, 100, 10, 10))
    run();
    repaint();
}

window.addEventListener('load',init,false);

