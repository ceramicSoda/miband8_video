var engine_frameTime;
var engine_timerInitX = -100;
var engine_timer_src = "down.bin";
var engine_timeout_index = 0;
var engine_timer = {
    cbMap: {},
    startTimer(key, cb, interval) {
        engine_timer.cbMap[key] = { cb: cb, interval: interval, time: interval, oneFlag: false };
    },
    startTimeout(cb, interval) {
        var key = "timeout" + engine_timeout_index++;
        engine_timer.cbMap[key] = { cb: cb, interval: interval, time: interval, oneFlag: true };
        return key;
    },
    stopTimer(key) {
        if (engine_timer.cbMap[key]) {
            delete engine_timer.cbMap[key];
        }
    },
    onUpdate(time) {
        var delObj = {};
        for (var k in engine_timer.cbMap) {
            var obj = engine_timer.cbMap[k];
            obj.time = obj.time - time;
            if (obj.time <= 0) {
                obj.cb();
                if (obj.oneFlag) {
                    delObj[k] = true;
                } else {
                    obj.time = obj.interval;
                }
            }
        }
        for (var k in delObj) {
            engine_timer.stopTimer(k);
        }
    },
};
function engine_afterAnimx() {
    engine_timer.onUpdate(engine_frameTime);
    set_obj_pos(engine_timerImg, engine_timerInitX, 200);
    refr_obj_pos(engine_timerImg);
    move_horizontal(engine_timerImg, -1 * engine_frameTime + engine_timerInitX, engine_frameTime);
}
function engine_startInterval(t) {
    engine_timerImg = create_img(0, engine_timer_src, engine_timerInitX, 200);
    engine_frameTime = t;
    refr_obj_pos(engine_timerImg);
    move_horizontal(engine_timerImg, -1 * engine_frameTime + engine_timerInitX, engine_frameTime);
    var em5 = new EventMap(0, [11], engine_afterAnimx, true);
    registerEvent(em5);
}
var bgImg, exitImg, resetImg;
var testImg;
var scoreLabel, hsLabel;
var currentFont = 4163;
var currentTime = 0;
var initPx = 130;
function exitImgCb() {
    set_animal_over_flag(1);
    exit_game();
}
function resetImgCb() {
    doJump();
}
function mainTimerCb() {}
function afterAnimy() {
    set_animal_over_flag(1);
}
function initUI() {
    var events = [7];
    resetImg = create_img(0, "left.bin", 56, 380);
    addEvent(resetImg, events, resetImgCb);
    gameOverExitImg = create_img(0, "return.bin", 78, 187);
    restartImg = create_img(0, "win.bin", 80, 267);
    scoreWidges[0] = create_img(0, scoreSrcs[0], 170, 300);
    scoreWidges[1] = create_img(0, scoreSrcs[0], 170, 310);
    scoreWidges[2] = create_img(0, scoreSrcs[0], 170, 320);
    scoreWidges[3] = create_img(0, scoreSrcs[0], 170, 330);
    maxScoreWidges[0] = create_img(0, scoreSrcs[0], 128, 224);
    maxScoreWidges[1] = create_img(0, scoreSrcs[0], 128, 234);
    maxScoreWidges[2] = create_img(0, scoreSrcs[0], 128, 244);
    maxScoreWidges[3] = create_img(0, scoreSrcs[0], 128, 254);
    addEvent(restartImg, events, restartGame);
    addEvent(gameOverExitImg, events, exitImgCb);
    var em2 = new EventMap(0, [1], exitImgCb, true);
    registerEvent(em2);
    set_obj_hidden(restartImg);
    set_obj_hidden(gameOverExitImg);
    var em4 = new EventMap(0, [12], afterAnimy, true);
    registerEvent(em4);
    engine_startInterval(10);
    engine_timer.startTimer(
        "main",
        function () {
            mainTimerCb();
            doGameUpdate();
        },
        10
    );
    var saved = { maxScore: 0 };
    readDataFromFile(saved);
    if (saved && saved.maxScore) {
        maxScore = saved.maxScore;
    }
}
function createGameObj() {
    var obj = {
        initX: 7,
        initY: 80,
        initSpeed: 6,
        cSpeed: 6,
        speedPlusScore: 500,
        maxSpeed: 18,
        cScore: 0,
        overFlag: false,
        jumping: false,
        state: 0,
        jumpSpeed: 10,
        jumpHeight: 100,
        currentJumpOffset: 0,
        spriteDif: 4,
        spriteDifOffset: 0,
        spriteIndex: 0,
        sprites: ["m1.bin", "m2.bin", "m3.bin", "m4.bin"],
    };
    return obj;
}
var gameObj = createGameObj();
var maxScore = 0;
var gameBgs = [
    { src: "up.bin", x: 0, y: 0, speed: gameObj.cSpeed, transy: -490 },
    { src: "up.bin", x: 0, y: 490, speed: gameObj.cSpeed, transy: 0 },
    { src: "n_2048.bin", x: 146, y: 490, speed: 2, transy: -46, lockSpeed: true },
];
var gameEnermys = [null, null, null, null];
var scoreWidges = [null, null, null, null];
var maxScoreWidges = [null, null, null, null];
var scoreSrcs = ["n_2.bin", "n_4.bin", "n_8.bin", "n_16.bin", "n_32.bin", "n_64.bin", "n_128.bin", "n_256.bin", "n_512.bin", "n_1024.bin"];
var enermyNextIndex = 0;
var gameOverImg;
var restartImg;
var gameOverExitImg;
var currentEnermyCb;
function doGameUpdate() {
    if (gameObj.overFlag) {
        return;
    }
    if (gameObj.jumping) {
        if (gameObj.state == 1) {
            gameObj.currentJumpOffset += gameObj.jumpSpeed;
            if (gameObj.currentJumpOffset >= gameObj.jumpHeight) {
                gameObj.currentJumpOffset = gameObj.jumpHeight;
                gameObj.state = 2;
            }
        } else {
            gameObj.currentJumpOffset -= gameObj.jumpSpeed;
            if (gameObj.currentJumpOffset <= 0) {
                gameObj.currentJumpOffset = 0;
                gameObj.state = 0;
                gameObj.jumping = false;
            }
        }
        set_obj_pos(gameObjWd, gameObj.initX + gameObj.currentJumpOffset, gameObj.initY);
    }
    gameObj.spriteDifOffset += 1;
    if (gameObj.spriteDifOffset == gameObj.spriteDif) {
        gameObj.spriteDifOffset = 0;
        gameObj.spriteIndex += 1;
        if (gameObj.spriteIndex >= gameObj.spriteDif) {
            gameObj.spriteIndex = 0;
        }
        set_img_src(gameObjWd, gameObj.sprites[gameObj.spriteIndex]);
    }
    for (var i = 0; i < gameBgs.length; i++) {
        var gObj = gameBgs[i];
        gObj.cy = gObj.cy - gObj.speed;
        if (gObj.cy <= gObj.transy) {
            gObj.cy = gObj.y;
        }
        set_obj_pos(gObj.wd, gObj.x, gObj.cy);
    }
    for (var i = 0; i < gameEnermys.length; i++) {
        var gObj = gameEnermys[i];
        if (gObj && gObj.visible) {
            gObj.y = gObj.y - gObj.speed;
            if (gObj.y <= gObj.transy) {
                gObj.visible = false;
                set_obj_hidden(gObj.wd);
            } else {
                set_obj_pos(gObj.wd, gObj.x, gObj.y);
            }
        }
    }
    gameObj.cScore += 1;
    if (gameObj.cScore % gameObj.speedPlusScore == 0) {
        gameObj.cSpeed += 2;
        if (gameObj.cSpeed > gameObj.maxSpeed) {
            gameObj.cSpeed = gameObj.maxSpeed;
        }
        setAllSpeed(gameObj.cSpeed);
    }
    resetScore();
    testGameOver();
}
function doJump() {
    if (gameObj.jumping) {
        return;
    }
    gameObj.jumping = true;
    gameObj.state = 1;
    gameObj.currentJumpOffset = 0;
}
function initGameObj() {
    gameObjWd = create_img(0, gameObj.sprites[0], gameObj.initX, gameObj.initY);
    for (var i = 0; i < gameBgs.length; i++) {
        gameBgs[i].cy = gameBgs[i].y;
        var wd = create_img(0, gameBgs[i].src, gameBgs[i].x, gameBgs[i].y);
        gameBgs[i].wd = wd;
    }
}
function createEnermy() {
    var objNew;
    var flag = rand_num() % 2 == 0;
    if (flag) {
        objNew = { src: "right.bin", x: 4, y: 490, cy: 490, speed: gameObj.cSpeed, transy: -50, visible: true, boxOffsetX: 22, boxOffsetY: 12, boxLength: 36 };
    } else {
        objNew = { src: "over.bin", x: 4, y: 490, cy: 490, speed: gameObj.cSpeed, transy: -50, visible: true, boxOffsetX: 17, boxOffsetY: 17, boxLength: 34 };
    }
    var obj = gameEnermys[enermyNextIndex];
    if (!obj) {
        objNew.wd = create_img(0, objNew.src, objNew.x, objNew.y);
    } else {
        objNew.wd = obj.wd;
        set_obj_display(objNew.wd);
    }
    set_obj_pos(objNew.wd, objNew.x, objNew.y);
    gameEnermys[enermyNextIndex] = objNew;
    enermyNextIndex++;
    if (enermyNextIndex >= gameEnermys.length) {
        enermyNextIndex = 0;
    }
    var intervalNext = parseInt(3000 / gameObj.cSpeed);
    var timedif1 = parseInt(intervalNext / 4);
    var timedif2 = timedif1 - parseInt(((rand_num() % 100) / 100) * (timedif1 * 2));
    currentEnermyCb = engine_timer.startTimeout(function () {
        createEnermy();
    }, intervalNext + timedif2);
}
function testGameOver() {
    var x = gameObj.initX + gameObj.currentJumpOffset + 23;
    var y = gameObj.initY + 22;
    for (var i = 0; i < gameEnermys.length; i++) {
        var gObj = gameEnermys[i];
        if (gObj && gObj.visible) {
            var aimX = gObj.x + gObj.boxOffsetX;
            var aimY = gObj.y + gObj.boxOffsetY;
            var length = gObj.boxLength;
            if (collisionDetection(x, y, aimX, aimY, length)) {
                gameOver();
                break;
            }
        }
    }
}
function collisionDetection(x, y, x2, y2, length) {
    var num1 = (x2 - x) * (x2 - x) + (y2 - y) * (y2 - y);
    return length * length >= num1;
}
function gameOver() {
    engine_timer.stopTimer(currentEnermyCb);
    set_obj_display(restartImg);
    set_obj_display(gameOverExitImg);
    gameObj.overFlag = true;
    if (maxScore < gameObj.cScore) {
        maxScore = gameObj.cScore;
        saveDataToFile({ maxScore: maxScore });
    }
    resetMaxScore(maxScore);
}
function setAllSpeed(s) {
    for (var i = 0; i < gameBgs.length; i++) {
        if (!gameBgs[i].lockSpeed) {
            gameBgs[i].speed = s;
        }
    }
    for (var i = 0; i < gameEnermys.length; i++) {
        var gObj = gameEnermys[i];
        if (gObj && gObj.visible) {
            gObj.speed = s;
        }
    }
}
function restartGame() {
    set_obj_hidden(restartImg);
    set_obj_hidden(gameOverExitImg);
    set_obj_hidden(maxScoreWidges[0]);
    set_obj_hidden(maxScoreWidges[1]);
    set_obj_hidden(maxScoreWidges[2]);
    set_obj_hidden(maxScoreWidges[3]);
    for (var i = 0; i < gameEnermys.length; i++) {
        var gObj = gameEnermys[i];
        if (gObj && gObj.visible) {
            set_obj_hidden(gObj.wd);
            gObj.visible = false;
        }
    }
    gameObj = createGameObj();
    set_obj_pos(gameObjWd, gameObj.initX, gameObj.initY);
    set_img_src(gameObjWd, gameObj.sprites[0]);
    setAllSpeed(gameObj.cSpeed);
    currentEnermyCb = engine_timer.startTimeout(function () {
        createEnermy();
    }, 1000);
}
function resetScore() {
    var s = gameObj.cScore;
    if (s % 10 == 0) {
        set_img_src(scoreWidges[0], scoreSrcs[parseInt(s / 1000) % 10]);
        set_img_src(scoreWidges[1], scoreSrcs[parseInt(s / 100) % 10]);
        set_img_src(scoreWidges[2], scoreSrcs[parseInt(s / 10) % 10]);
        set_img_src(scoreWidges[3], scoreSrcs[parseInt(s % 10)]);
    }
}
function resetMaxScore(s) {
    set_obj_display(maxScoreWidges[0]);
    set_obj_display(maxScoreWidges[1]);
    set_obj_display(maxScoreWidges[2]);
    set_obj_display(maxScoreWidges[3]);
    set_img_src(maxScoreWidges[0], scoreSrcs[parseInt(s / 1000) % 10]);
    set_img_src(maxScoreWidges[1], scoreSrcs[parseInt(s / 100) % 10]);
    set_img_src(maxScoreWidges[2], scoreSrcs[parseInt(s / 10) % 10]);
    set_img_src(maxScoreWidges[3], scoreSrcs[0]);
}
function main() {
    initUI();
    initGameObj();
    restartGame();
}
main();
