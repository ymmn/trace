function StartMenu() {

    ////////////////  CONSTANTS  ///////////////
    /* states */
    var INITIAL = -100;
    var SELECT_LEVEL = -101;
    var ENABLED_BTN_COLOR = "#999";
    var HOVER_BTN_COLOR = "#BBB";
    var SELECTED_BTN_COLOR = "#555";
    var DISABLED_BTN_COLOR = "#CCC";
    var DIFFICULTY_BTN_LOCATIONS = [
        {
            x: 193,
            y: 217,
            rad: 10,
            size: 4
        },
        {
            x: 256,
            y: 306,
            rad: 20,
            size: 12
        },
        {
            x: 358,
            y: 397,
            rad: 32,
            size: 14
        },
        {
            x: 514,
            y: 478,
            rad: 46,
            size: 20
        }
    ];

    ////////////////  PRIVATE VARIABLES ///////////////
    /* icons */
    var _soundOnImg;
    var _soundOffImg;
    /* start menu */
    var _startButton;
    var _achievementButton;
    var _creditsButton;
    var _initialMenu;
    /* level select */
    var _levelBtnsContainer;
    var _difficultyBtnsContainer;
    var _difficultySelectedGlow;
    var _tempGlow;
    var _levelSelectMenu;
    var _levelBtns;
    var _levelLabel;
    var _difficultyLabel;
    var _goBtn;
    var _selectedLevelCircle;
    var _difficultyBtns;
    /* state */
    var _selectedLevel = 1;
    var _state = INITIAL;
    var that = this;
    var _bigContainer;


    ///////////////  BTN CLICK HANDLERS ////////////////
    var _startBtnOnclick = function(){
        _state = SELECT_LEVEL;
        that.refresh();
    };

    var _achievementBtnOnclick = function() {
        Clay.Achievement.showAll();
    };

    var _creditsBtnOnclick = function() {
        alert("By Abdelrahman Nimeri and Lisa Huang.");
    };

    var _refreshSelectedLevelText = function(lvl) {
        _levelLabel.text = LEVELS[lvl].name;

        /* Display the top score for this level */
        var ts_percent = moosetrack.top_scores[moosetrack.current_difficulty][lvl];
        if(ts_percent === undefined) return;
        var grade = moosetrack.getGradeFromPercentage(ts_percent);
        _levelLabel.text = LEVELS[lvl].name + ": " + grade + "  " + ts_percent;
    };

    var _lvlBtnOnclick = function(lvl, coords) {
        if( coords !== undefined ) {
            _selectedLevelCircle.x = coords.x;
            _selectedLevelCircle.y = coords.y;
        }
        _refreshSelectedLevelText(lvl);
    };

    var _goBtnOnclick = function () {
        moosetrack.startLevel(_selectedLevel);
    };

    var _difficultyBtnOnclick = function() {
        moosetrack.current_difficulty = this.diffInd;
        _difficultyLabel.text = DIFFICULTIES[moosetrack.current_difficulty];
        _difficultySelectedGlow.x = this.loc.x;
        _difficultySelectedGlow.y = this.loc.y;
        _difficultySelectedGlow.scaleX = this.loc.rad / 36;
        _difficultySelectedGlow.scaleY = this.loc.rad / 36;
        _refreshSelectedLevelText(_selectedLevel);
    };


    ///////////////  PRIVATE METHODS ////////////////
    var _init = function() {
        _bigContainer = new createjs.Container();

        /* sound on off */
        _soundOnImg = new createjs.Bitmap("assets/sound_on.png");
        _soundOnImg.x = CANVAS_WIDTH - 70;
        _soundOnImg.y = CANVAS_HEIGHT - 70;
        _soundOnImg.addEventListener("click", function(){
            _bigContainer.removeChild(_soundOnImg);
            _bigContainer.addChildAt(_soundOffImg, 1);
            moosetrack.toggleSound();
        });
        _soundOffImg = new createjs.Bitmap("assets/sound_off.png");
        _soundOffImg.x = CANVAS_WIDTH - 70;
        _soundOffImg.y = CANVAS_HEIGHT - 70;
        _soundOffImg.addEventListener("click", function(){
            _bigContainer.removeChild(_soundOffImg);
            _bigContainer.addChildAt(_soundOnImg, 1);
            moosetrack.toggleSound();
        });

        _bigContainer.addChildAt(_soundOnImg, 1);
    };

    var _createInitialMenu = function() {
        _initialMenu = new createjs.Container();


        /* background */
        var bgd = new createjs.Bitmap("assets/startscreen(nowords).png");
        _initialMenu.addChild(bgd);

        /* logo */
        var bitmap = new createjs.Bitmap("assets/logo.jpg");
        bitmap.y -= 200;
        bitmap.x += 80;


        /* start button and its listeners */
        _startButton = new CenteredButton(698, 458, 105,
            {
                background: ["assets/startcircle1.png", "assets/startcircle2.png"],
                text: "s  t  a  r  t",
                textColor: "black",
                hoverTextColor: "red",
                font: "36px myriad-pro"
            });
        _startButton.onclick = _startBtnOnclick;
        _initialMenu.addChild(_startButton.shape);

        /* Achievements button and its listeners */
        _achievementButton = new CenteredButton(208, 450, 85, {
            background: ["assets/achievementscircle.png"],
            text: "a c h i e v e m e n t s",
            textColor: "black",
            hoverTextColor: "red",
            font: "19px myriad-pro"
        });
        _achievementButton.onclick = _achievementBtnOnclick;
        _initialMenu.addChild(_achievementButton.shape);

        /* credits button and its listeners */
        _creditsButton = new CenteredButton(140, 600, 0, {
            text: "c r e d i t s",
            isHovered: function() {
                var mx = mousex;
                var my = mousey;
                return mx > 40 && mx < 240 && my > 580 && my < 620;
            },
            textColor: "#999",
            hoverTextColor: "#900",
            font: "48px myriad-pro"
        });
        _creditsButton.onclick = _creditsBtnOnclick;
        _initialMenu.addChild(_creditsButton.shape);

        return _initialMenu;
    };

    var _createLevelSelectMenu = function() {

        _levelSelectMenu = new createjs.Container();

        /* difficulty selected glowing ball */
        _difficultySelectedGlow = new createjs.Bitmap("assets/glowingball.png");
        _difficultySelectedGlow.regX = 75;
        _difficultySelectedGlow.regY = 75;
        _levelSelectMenu.addChild(_difficultySelectedGlow);

        /* on hover glow */
        _tempGlow = new createjs.Bitmap("assets/glowingball.png");
        _tempGlow.regX = 75;
        _tempGlow.regY = 75;
        _tempGlow.alpha = 0;
        _levelSelectMenu.addChild(_tempGlow);

        /* background */
        var bgd = new createjs.Bitmap("assets/levelscreen(nogo).png");
        _levelSelectMenu.addChild(bgd);



        /* make a button for each level */
        _levelBtns = [];
        _levelBtnsContainer = new createjs.Container();
        var lvlBtnsGap = 37;
        for(var i = 0; i < 9; i++) {
            var color = "#EEE";
            var lvl = i + 1;
            var x = 530 + lvlBtnsGap * i;
            var y = 240;
            var btn = new CenteredButton(x, y, 9,
                {
                    fillColor: color,
                    hoverColor: "#AAA",
                    onhover: function(btn){
                        _lvlBtnOnclick(btn.lvl);
                    },
                    onLoseHover: function(){
                        _lvlBtnOnclick(_selectedLevel);
                    }
                });
            btn.lvl = lvl;
            btn.x = x;
            btn.y = y;
            btn.onclick = function(){
                _selectedLevel = this.lvl;
                console.log(this.lvl);
                _lvlBtnOnclick(this.lvl, this);
            };
            _levelBtns.push(btn);
            _levelBtnsContainer.addChild(btn.shape);
        }

        //     /* Display the top score for this level */
        //     var ts_percent = moosetrack.top_scores[moosetrack.current_difficulty][lvl];
        //     if( ts_percent !== undefined ) {
        //         var topscore = new createjs.Text(
        //             ts_percent + "% " + moosetrack.getGradeFromPercentage(ts_percent),
        //             '25px Helvetica', '#333'
        //         );
        //         topscore.textAlign = "center";
        //         topscore.x = CANVAS_WIDTH / 2 + 100;
        //         topscore.y = y - 13;
        //         /* color code the score */
        //         topscore.color = moosetrack.getScoreColor(ts_percent);
        //         _levelBtnsContainer.addChild(topscore);
        //     }
        
        _levelSelectMenu.addChild(_levelBtnsContainer);

        /* selected level Circle */
        _selectedLevelCircle = new createjs.Shape();
        _selectedLevelCircle.graphics.beginFill("#333").drawCircle(0, 0, 15);
        _levelSelectMenu.addChild(_selectedLevelCircle);

        // /* make a button for each difficulty */
        _difficultyBtns = [];
        _difficultyBtnsContainer = new createjs.Container();
        var l = DIFFICULTIES.length;
        for(var i = 0; i < l; i++) {
            var btn = new CenteredButton(DIFFICULTY_BTN_LOCATIONS[l - i - 1].x, DIFFICULTY_BTN_LOCATIONS[l - i - 1].y, DIFFICULTY_BTN_LOCATIONS[l - i - 1].rad,
                {
                    onhover : function(btn) {
                        _tempGlow.x = btn.loc.x;
                        _tempGlow.y = btn.loc.y;
                        _tempGlow.scaleX = btn.loc.rad / 36;
                        _tempGlow.scaleY = btn.loc.rad / 36;
                        _tempGlow.alpha = 1;
                    }
                }
            );
            btn.diffInd = i;
            btn.loc = DIFFICULTY_BTN_LOCATIONS[l - i - 1];
            btn.onclick = _difficultyBtnOnclick;
            _difficultyBtns.push(btn);
            _difficultyBtnsContainer.addChild(btn.shape);

            /* add the accumulative score under the difficulty */
            var scoreTxt = new createjs.Text("" + moosetrack.calculateAccScoreForDifficulty(i), "28px silom");
            scoreTxt.x = btn.loc.x;
            scoreTxt.y = btn.loc.y + btn.loc.rad + 5;
            scoreTxt.textAlign = "center";
            _levelSelectMenu.addChild(scoreTxt);
        }
        _levelSelectMenu.addChild(_difficultyBtnsContainer);


        /* GO button */
        _goBtn = new CenteredButton(777, 505, 70, { text: "go", background: ["assets/greenthing.png"] });
        _goBtn.onclick = _goBtnOnclick;
        _levelSelectMenu.addChild(_goBtn.shape);

        /* back button */
        _backBtnImg = new createjs.Bitmap("assets/back.png");
        _backBtnImg.x = 10;
        _backBtnImg.y = 40;
        _backBtnImg.addEventListener("click", that.switchToMainMenu);
        _levelSelectMenu.addChild(_backBtnImg);

        /* selected level label */
        _levelLabel = new createjs.Text(LEVELS[_selectedLevel].name, "28px silom", "#333");
        _levelLabel.x = 596;
        _levelLabel.y = 175;
        _levelSelectMenu.addChild(_levelLabel);


        /* selected difficulty label */
        _difficultyLabel = new createjs.Text(DIFFICULTIES[moosetrack.current_difficulty], "28px silom", "#333");
        _difficultyLabel.x = 195;
        _difficultyLabel.y = 570;
        _levelSelectMenu.addChild(_difficultyLabel);



        /* now place glow on selected difficulty */
        _difficultyBtns[moosetrack.current_difficulty].onclick();
        /* and auto select first level */
        _levelBtns[0].onclick();

        return _levelSelectMenu;
    };

    var CenteredButton = function(x, y, radius, options) {

        if(options === undefined) options = {};

        /* states */
        var OUT = -1000;
        var HOVER = -1001;
        var CLICKING = -1002;
        /* fonts */
        var NORMAL_FONT = '28px silom';
        var HOVERED_FONT = '48px silom';


        var state = OUT;
        var wasHovered = false;


        var button = new createjs.Container();
        var that = this;

        /* decide font */
        var font = NORMAL_FONT;
        if (options.font !== undefined) {
            font = options.font;
        }

        /* optional background image that rotates on hover */
        var background = [];
        if(options.background !== undefined) {
            for(var i = 0; i < options.background.length; i++) {
                var bmp = new createjs.Bitmap(options.background[i]);
                bmp.regX = x;
                bmp.regY = y;
                bmp.x = x;
                bmp.y = y;
                background.push(bmp);
                button.addChild(bmp);
            }
        }

        /* fill */
        if( options.fillColor !== undefined ) {
            var fillCircle = new createjs.Shape();
            fillCircle.graphics.beginFill(options.fillColor).drawCircle(x, y, radius);
            button.addChild(fillCircle);
        }

        /* define text color */
        var textColor = "#FFF";
        if( options.textColor !== undefined) {
            textColor = options.textColor;
        }

        /* text */
        var title;
        if( options.text !== undefined ) {
            title = new createjs.Text(options.text, font, textColor);
            title.x = x;
            title.y = y - (title.getMeasuredHeight() / 2);
            title.textAlign = "center";
            button.addChild(title);
        }


        /* highlight */
        var highlightCircle = new createjs.Shape();
        var highlightColor = "black";
        if (options.highlightColor !== undefined) {
            highlightColor = options.highlightColor;
        }


        button.addChild(highlightCircle);
        this.shape = button;

        var isHovered = function () {
            var mx = mousex;
            var my = mousey;
            var dx = Math.abs(mx - x);
            var dy = Math.abs(my - y);
            return Math.sqrt( dx*dx + dy*dy ) <= radius;
        };
        if (options.isHovered !== undefined) {
            isHovered = options.isHovered;
        }

        this.isClicked = function () {
            var in_btn = isHovered();

            /* proper click is hovering over button, clicking down mouse, and lifting up mouse */
            if( !in_btn ) {
                state = OUT;
                return false;
            } else {
                /* mouse within button */
                if ( state === OUT ) {
                    if ( !mouseDown ) {
                        state = HOVER;
                    }
                } else if ( state === HOVER ) {
                    if( mouseDown ) {
                        state = CLICKING;
                    }
                } else if ( state === CLICKING ) {
                    if( !mouseDown ) {
                        state = HOVER;
                        return true;
                    }
                }
            }

            return false;
        };

        this.tick = function () {
            /* highlight button if it's being hovered */
            if(isHovered()) {
                for(var i = 0; i < background.length; i++) {
                    background[i].rotation += (i % 2 == 0 ? 1 : -1) * 2;
                }
                if(options.hoverColor !== undefined) {
                    fillCircle.graphics.clear().beginFill(options.hoverColor).drawCircle(x, y, radius);
                }
                if( options.onhover !== undefined ) {
                    options.onhover(that);
                }
                if(options.hoverTextColor !== undefined) {
                    title.color = options.hoverTextColor;
                }
                wasHovered = true;
                // highlightCircle.graphics.setStrokeStyle(2)
                //     .beginStroke(highlightColor)
                //     // .beginRadialGradientStroke(["#F00","#00F"], [0, 1], x, y, radius-2, x, y, radius)
                //     .drawCircle(x, y, radius);
            } else {
                if(wasHovered && options.onLoseHover !== undefined) {
                    options.onLoseHover();
                }
                if(options.hoverColor !== undefined) {
                    fillCircle.graphics.clear().beginFill(options.fillColor).drawCircle(x, y, radius);
                }
                if(title !== undefined) title.color = textColor;
                highlightCircle.graphics.clear();
                wasHovered = false;
            }
            if (this.isClicked()) {
                createjs.Sound.play("btn-click", createjs.Sound.INTERRUPT_NONE, 0, 0, 0, 0.4);
                this.onclick();
            }
        };

    };




    //////////////// PUBLIC METHODS //////////////
    this.tick = function () {
        if( _state === INITIAL ) {
            _startButton.tick();
            _achievementButton.tick();
            _creditsButton.tick();
        } else if(_state === SELECT_LEVEL) {
            _tempGlow.alpha = 0;
            for(var i = 0; i < _levelBtns.length; i++) {
                _levelBtns[i].tick();
            }
            for(var i = 0; i < _difficultyBtns.length; i++) {
                _difficultyBtns[i].tick();
            }
            _goBtn.tick();
        }
    };

    this.switchToLevelSelect = function(){
        _state = SELECT_LEVEL;
        _bigContainer.removeChild(_initialMenu);
        _bigContainer.removeChild(_levelSelectMenu);
        _bigContainer.addChildAt(_createLevelSelectMenu(), 0);
    };

    this.switchToMainMenu = function() {
        _state = INITIAL;
        _bigContainer.removeChild(_initialMenu);
        _bigContainer.removeChild(_levelSelectMenu);
        _bigContainer.addChildAt(_createInitialMenu(), 0);
    };

    this.refresh = function() {
        console.log("called");
        if( _state === SELECT_LEVEL ) {
            that.switchToLevelSelect();
        } else {
            that.switchToMainMenu();
        }
    };

    this.getContainer = function() {
        return _bigContainer;
    };


    _init();

};