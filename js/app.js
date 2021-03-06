/*jslint bitwise:true, es5: true*/
(function(window, undefined){
    'use strict';
    var canvas = null;
    var ctx  = null;
    // var x = 50, y = 50;
    var lastPress = null;
    var KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40,
        KEY_ENTER = 13;
    var dir = 0;
    var pause = true;
    // var player = null;
    var body = [];
    var food = null;
    var score = 0;
    var wall = [];
    var gameover = false;
    var iBody = new Image();
    var iFood = new Image();
    var aEat = new Audio();
    var aDie = new Audio();
    var buffer = null;
    var bufferCtx = null;
    var bufferScale = 1,
        bufferOffSetX = 0,
        bufferOffSetY = 0;
    var MAIN_SCENE = 0,
        GAME_SCENE = 1,
        currentScene = 0,
        scenes = [];
    var mainScene = null,
        gameScene = null;
    var highscores = [],
        posHighscore = 10,
        highscoresScene = null;
    var specialFood = null;
    var url = 'www.jsonplaceholder.com'


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
        this.x = (x === null) ? 0 : x;
        this.y = (y === null) ? 0 : y;
        this.width = (width === null) ? 0 : width;
        this.height = (height === null) ? this.width : height;
    }

    Rectangle.prototype.intersects = function(rect){
        if(rect === undefined){
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
        }
    };

    Rectangle.prototype.fill = function(ctx){
        if(ctx === undefined) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    Rectangle.prototype.drawImage = function(ctx, img){
        if (img === undefined) {
            window.console.warn('Missing parameters on function drawImage');
        } else {
            if (img.width) {
                ctx.drawImage(img, this.x, this.y);
            } else {
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }
    }

    function Scene() {
        this.id = scenes.length;
        scenes.push(this);
    };
    Scene.prototype = {
        constructor : Scene,
        load : function() {},
        paint: function(ctx) {},
        act : function(){}
    };

    function random(max) {
        return ~~(Math.random() * max);
    }

    function resize(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var w = window.innerWidth / buffer.width;
        var h = window.innerHeight / buffer.height;
        bufferScale = Math.min(h, w);

        bufferOffSetX =(canvas.width -(buffer.width * bufferScale))/2;
        bufferOffSetY =(canvas.height -(buffer.height * bufferScale))/2;
    }

    function repaint(){
        window.requestAnimationFrame(repaint);
        if(scenes.length){
            scenes[currentScene].paint(bufferCtx);
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled =false;
        ctx.drawImage(buffer, bufferOffSetX, bufferOffSetY, buffer.width * bufferScale, buffer.height * bufferScale);
    }

    function run(){
        setTimeout(run, 50);
        if(scenes.length){
            scenes[currentScene].act();
        }
    }

    function canPlayOgg() {
        var aud = new Audio();
        if(aud.canPlayType('audio/ogg').replace(/no/,'')){
            return true;
        } else {
            return false;
        }
    }

    function loadScene(scene){
        currentScene = scene.id;
        scenes[currentScene].load();
    };

    function addHighscore(score){
        posHighscore = 0;
        while( highscores[posHighscore] > score && posHighscore < highscores.length){
            posHighscore += 1;
        }
        highscores.splice(posHighscore,0,score);
        if(highscores.length > 10){
            highscores.length = 10;
        }
        localStorage.highscores = highscores.join(',');
    }

    function specialFoodSpawn(){
        if(specialFood === null) {
            setTimeout(function(){
                specialFood = new Rectangle(random(buffer.width / 10 - 1 ) * 10,random(buffer.height / 10 - 1 ) * 10, 10, 10);
            } , random(10) * 1000);
        }
    }

    function sendScore(){
        var promise = fetch(url + '?score='+score);
        promise.then(function(res){
                return res.json()
                })
                .then(function(values){
                    console.log('Score sent successfully')
                });
        promise.catch(function(error) {
            console.log('Error trying to send the score');
        });
    }

    function init(){
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        //Load buffer
        buffer = document.createElement('canvas');
        bufferCtx = buffer.getContext('2d');
        buffer.width = 300;
        buffer.height = 150;

        iBody.src = './assets/body.png';
        iFood.src = './assets/fruit.png';

        if(canPlayOgg()){
            aEat.src = './assets/chomp.oga';
            aDie.src = './assets/dies.oga';
        } else {
            console.log('Browser cant play ogg audio format')
        }

        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));

        food = new Rectangle(80, 80, 10, 10);

        wall.push(new Rectangle(100, 50, 10, 10))
        wall.push(new Rectangle(100, 100, 10, 10))
        wall.push(new Rectangle(200, 50, 10, 10))
        wall.push(new Rectangle(200, 100, 10, 10))

        //Load saved highscores
        if(localStorage.highscores){
            highscores = localStorage.highscores.split(',');
        }

        resize()
        run();
        repaint();
    }

    //Main Scene
    mainScene = new Scene();

    mainScene.paint = function(ctx){
        //Clear Canvas
        ctx.fillStyle = '#080';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //Draw Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('SNAKE',150,60);
        ctx.fillText('Press Enter',150,90);
    }

    mainScene.act = function(){
        if(lastPress === KEY_ENTER){
            loadScene(gameScene);
            lastPress = null;
        }
    }

    //Highscore Scene
    highscoresScene = new Scene();

    highscoresScene.paint = function(ctx){
        var i = 0, l = 0;

        //Clear Canvas
        ctx.fillStyle = '#080';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //Draw Title
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('HIGH SCORES', 150, 30);

        //Draw High scores
        ctx.textAlign = 'right';
        for(i = 0, l = highscores.length; i < l ; i++){
            if(i === posHighscore){
                ctx.fillText('[NEW]:' + highscores[i], 180, 40 + (i * 10));
            } else {
                ctx.fillText(highscores[i], 180, 40 + (i * 10))
            }
        }
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
    };

    highscoresScene.act = function(){
        if(lastPress === KEY_ENTER){
            loadScene(gameScene);
            lastPress = null;
        }
    }

    //Game Scene
    gameScene = new Scene();

    gameScene.load = function(){
        specialFood = null;
        specialFoodSpawn();
        score = 0;
        dir = 1;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        food.x = random(buffer.width / 10 - 1 ) * 10;
        food.y = random(buffer.height / 10 - 1 ) * 10;
        gameover = false;
    }

    gameScene.paint = function(ctx){
        //Clear Canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0,0,canvas.width,canvas.height);

        //Draw Player
        ctx.fillStyle = '#0f0';
        for(var i = 0, l = body.length; i < l; i++){
            // body[i].fill(ctx);
            body[i].drawImage(ctx, iBody);
        };

        //Draw Food
        // ctx.fillStyle = '#f00';
        // food.fill(ctx);
        food.drawImage(ctx, iFood);
        ctx.fillStyle= '#fff';
        if(specialFood !== null){
            specialFood.fill(ctx)
        }
        ctx.fillStyle = '#0f0';

        //Draw Walls
        ctx.fillStyle = '#999';
        for(i = 0, l = wall.length; i < l; i++){
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

    gameScene.act = function(){
        if(!pause){
            //Check game over
            if(gameover){
                // reset();
                loadScene(highscoresScene);
            }

            //Move Body
            for(var i = body.length - 1; i > 0; i -= 1){
                body[i].x = body[i-1].x;
                body[i].y = body[i-1].y;
            }

            //Change Direction
            if(lastPress === KEY_UP && dir !== 2) {
                dir = 0;
            }
            if(lastPress === KEY_RIGHT && dir !== 3) {
                dir = 1;
            }
            if(lastPress === KEY_DOWN && dir !== 0) {
                dir = 2;
            }
            if(lastPress === KEY_LEFT && dir !== 1) {
                dir = 3;
            }

            //Move Rect
            if(dir === 0){
                body[0].y -= 10;
            }
            if(dir === 1){
                body[0].x += 10;
            }
            if(dir === 2){
                body[0].y += 10;
            }
            if(dir === 3){
                body[0].x -= 10;
            }

            //Out Screen
            if(body[0].x > buffer.width - body[0].width){
                body[0].x = 0;
            }
            if(body[0].y > buffer.height - body[0].height){
                body[0].y = 0;
            }
            if(body[0].x < 0){
                body[0].x = buffer.width - body[0].width;
            }
            if(body[0].y < 0){
                body[0].y = buffer.height - body[0].height;
            }

            //Wall Intersects
            for(var i = 0, l = wall.length; i < l; i++){
                if(food.intersects(wall[i])){
                    food.x = random(buffer.width / 10 - 1 ) * 10
                    food.y = random(buffer.height / 10 - 1 ) * 10
                }
                if(body[0].intersects(wall[i])){
                    addHighscore(score);
                    aDie.play();
                    gameover = true;
                    pause = true;
                }
                if(specialFood !== null && specialFood.intersects(wall[i])){
                    specialFood.x = random(buffer.width / 10 - 1 ) * 10;
                    specialFood.y = random(buffer.height / 10 - 1 ) * 10;
                }
            }

            //Body Intersects
            for(i = 2, l = body.length; i < l; i += 1){
                if(body[0].intersects(body[i])){
                    addHighscore(score);
                    aDie.play();
                    gameover = true;
                    pause = true;
                }
            }

            //Food Intersects
            if (body[0].intersects(food)) {
                score += 1;
                aEat.play();
                body.push(new Rectangle(food.x, food.y, 10, 10));
                food.x = random(buffer.width / 10 - 1 ) * 10
                food.y = random(buffer.height / 10 - 1 ) * 10
            }
            if(specialFood !== null){
                if (body[0].intersects(specialFood)){
                    score += 1;
                    sendScore();
                    aEat.play();
                    specialFood = null;
                    specialFoodSpawn();
                }
            }

        }
        if(lastPress === KEY_ENTER){
            pause = !pause;
            lastPress = null;
        }
    }
    window.addEventListener('resize', resize, false);
    window.addEventListener('load',init,false);
}(window));
