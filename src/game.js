///////////////// CONSTANTS ////////////////
var CANVAS_WIDTH = 960;
var CANVAS_HEIGHT = 640;
var OFFSET_X;
var OFFSET_Y;
var CIRCLE_RAD = [30, 22, 12, 5];
var CIRCLE_COLOR = "red";
var GOAL_FPS = 30;
var PASSING_SCORE = 70;
var DIFFICULTIES = ["easy", "medium", "hard", "!"];


////////////////  GLOBAL VARIABLES ///////////////
/* input */
var mousex;
var mousey;
var mouseDown = false;




var moosetrack = function() {

    ////////////////  PRIVATE VARIABLES ///////////////
    /* states */
    var START_MENU = -100;
    var PLAYING = -101;

    var _game_state;
    var _curLevel;
    var _startMenu;
    var _stage;
    var _messageField;


    /* holds public methods */
    var p = {};

    /* game state */
    p.current_difficulty = 0;
    p.top_scores = [{}, {}, {}, {}];
    p.num_rounds = 0;
    p.soundOn = true;
    p.leaderboardCutoff = [0, 0, 0, 0];


    ///////////////// HELPERS ////////////////
    p.calculateAccScoreForDifficulty = function(difficulty) {
        if(difficulty === undefined) {
            difficulty = p.current_difficulty;
        }
        var scores = moosetrack.top_scores[difficulty];
        var accScore = 0;
        for(var s = 0; s < Object.keys(scores).length; s++) {
            accScore += Math.floor( scores[ Object.keys(scores)[s] ] );
        }
        return accScore;
    };

    p.startLevel = function(lvl) {
        _stage.removeChild(_startMenu.getContainer());
        _game_state = PLAYING;
        if (_curLevel !== undefined) {
            _stage.removeChild(_curLevel.getContainer());
        }
        var l = (Object.keys(LEVELS).length + 1);
        console.log(lvl);
        if( lvl < l ) {
            _curLevel = new GameLevel(lvl);
            _stage.addChild(_curLevel.getContainer());
        } else {
            _stage.addChild(_startMenu.getContainer());
            _game_state = START_MENU;
        }
    };

    p.gotoStartMenu = function() {
        _game_state = START_MENU;
        _startMenu.refresh();
        if(_curLevel !== undefined) {
            _stage.removeChild(_curLevel.getContainer());
        }
        _stage.removeChild(_startMenu.getContainer());
        _stage.addChild(_startMenu.getContainer());
    };

    p.toggleSound = function() {
        p.soundOn = !p.soundOn;
        createjs.Sound.setMute(!p.soundOn);
    };

    p.getGradeFromPercentage = function(percentage) {
        var grade = "F";
        if (percentage > 98) {
            grade = "A+";
        } else if (percentage > 90) {
            grade = "A";
        } else if (percentage > 80) {
            grade = "B";
        } else if (percentage > 70) {
            grade = "C";
        } else if (percentage > 60) {
            grade = "D";
        }
        return grade;
    };

    p.getScoreColor = function(percentage) {
        var r = Math.round(((100-percentage)/100) * 15).toString(16);
        var g = Math.round((percentage/100) * 15).toString(16);
        var b = "6";
        return "#" + r + g + b;
    };

    ///////////////// CORE ////////////////
    var _updateLoading = function () {
        _messageField.text = "Loading " + (preload.progress*100|0) + "%";
        _stage.update();
    };


    var _doneLoading = function () {

        _stage.removeChild(_messageField);
        _messageField.text = "";

        /* play music */
        // createjs.Sound.play("background", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.4);


        /* load scores if cookie exists */
        var cookieVal = $.cookie('state');
        if(cookieVal !== undefined) {
           var state = JSON.parse(cookieVal);
           p.top_scores = state.top_scores;
           p.num_rounds = state.num_rounds;
        }


        /* initial game state */
        _game_state = START_MENU;


        /* register handlers */
        document.body.onmousemove = function (e) {
            // console.log(e);
            var x = e.clientX || e.x;
            var y = e.clientY || e.y;
            mousex = x - OFFSET_X + window.scrollX;
            mousey = y - OFFSET_Y + window.scrollY;
            // console.log(mousex + ", " + mousey);
        };
        document.body.onmousedown = function () {
            mouseDown = true;
        };
        document.body.onmouseup = function () {
            mouseDown = false;
        };


        /* background */
        // var bgd = new createjs.Bitmap("assets/background.jpg");
        // _stage.addChild(bgd);

        /* start menu */
        _startMenu = new StartMenu();

        /* start game timer */
        if (!createjs.Ticker.hasEventListener("tick")) {
            createjs.Ticker.addEventListener("tick", _tick);
        }
        createjs.Ticker.setFPS(GOAL_FPS);


        p.gotoStartMenu();
    };

    var _calculateLeaderboardCutoffs = function(diff) {
        var leaderboard = new Clay.Leaderboard( { id: 3330 + diff } );

        leaderboard.fetch({}, function(res) {
            // console.log(diff);
            /* set cutoff to the 10th highest score */ 
            var l = Math.min(10, res.length);
            // console.log("Of length " + l);
            for(var i = 0; i < l; i++) {
                // console.log((i+1) + "th score is " + res[i].score);
                if( res[i].me ) {
                    // console.log("MY SCORE");
                    p.leaderboardCutoff[diff] = res[i].score;
                    return;
                }
            }
            if( l < 10 ) {
                p.leaderboardCutoff[diff] = 0;
            } else {
                p.leaderboardCutoff[diff] = res[l-1].score;
            }
        });
    };

    p.init = function() {

        /* define canvas dimension constants */
        var canvas = document.getElementById("gameCanvas");

        OFFSET_X = canvas.offsetLeft;
        OFFSET_Y = canvas.offsetTop;

        /* create stage */
        _stage = new createjs.Stage(canvas);

        /* show loading */
        _messageField = new createjs.Text("Loading", "bold 24px Arial", "#000");
        _messageField.maxWidth = 1000;
        _messageField.textAlign = "center";
        _messageField.x = canvas.width / 2;
        _messageField.y = canvas.height / 2;
        _stage.addChild(_messageField);
        _stage.update();

        for(var i = 0; i < 4; i++) {
            _calculateLeaderboardCutoffs(i);
        }

        /* begin loading content (only sounds to load) */
        var manifest = [
            {id:"count", src:"assets/count.wav"},
            {id:"countdown", src:"assets/count.wav"},
            {id:"start-playing", src:"assets/start-playing.wav"},
            {id:"background", src:"assets/background.mp3"},
            {id:"btn-click", src:"assets/button.wav"}
        ];

        preload = new createjs.LoadQueue();
        preload.installPlugin(createjs.Sound);
        preload.addEventListener("complete", _doneLoading); // add an event listener for when load is completed
        preload.addEventListener("progress", _updateLoading);
        preload.loadManifest(manifest);

        // REMOVE LATER
        // _doneLoading();

    };


    var _tick = function(event) {
        if (_game_state === START_MENU) {
            _startMenu.tick();
        } else if (_game_state === PLAYING) {
            _curLevel.tick();
        }
        _stage.update();
    };

    return p;

}();