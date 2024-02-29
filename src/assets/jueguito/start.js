import { kabum } from './main.js';
export const gameStart = () => {


    kabum.destroyAll()

    let SCALE = 2.5;
    let JUMP_FORCE = 2500;
    if (kabum.width() < 1000) {
        SCALE = 2;
        JUMP_FORCE = 2100;
    } else if (kabum.width() < 1800) {
        SCALE = 2.5;
        JUMP_FORCE = 2500
    } else {
        SCALE = 3;
        JUMP_FORCE = 3000;
    }
    const FLOOR_HEIGHT = 4;

    const FLOOR_HIGHT = 100;
    const FLOOR_COLLISION = 30;
    const GRAVITY = 4000;
    let SPEED = 10;
    let numHorizon = 12;
    const horizonColor = 130
    let horizonSeparation = 0;
    const horizonM = 7;
    let parallax = [];
    // Definición de la escena
    const STARTGRAVITY = 0.2;
    const ROPELENGTH = kabum.height() / 2;
    let swinging = true;
    let swingingMax = 50; // Grados máximos de inclinación
    let velocidadBalanceo = 2; // Velocidad de balanceo
    //añade cuerda


    let positionRope = { x: kabum.width() / 2, y: 0, angle: 0, vx: 0, vy: 0, va: 0 };
    let positionCharacter = { x: kabum.width() / 2, y: kabum.height() / 3, angle: 0, vx: 0, vy: 0, va: 0 };


    let rope = kabum.add([
        kabum.rect(2 * SCALE, ROPELENGTH),
        // outline(4),
        kabum.pos(positionRope.x, positionRope.y),
        kabum.anchor("top"),
        // area({ offset: kabum.vec2(0, FLOOR_COLLISION) }),
        // kabum.body({ isStatic: true }),
        kabum.color(127, 127, 127),
        "rope"
    ]);

    let base = kabum.add([
        kabum.circle(10 * SCALE),
        kabum.pos(kabum.width() / 2, 0),
        kabum.anchor("center"),
        kabum.color(127, 127, 127),
        "base"
    ]);

    let mainCharacter = kabum.add([kabum.sprite("miquiDino"), kabum.pos(positionRope.x - 4 * SCALE, positionRope.y - 7 * SCALE), kabum.scale(SCALE), kabum.anchor("center"), kabum.z(1000), "dino"]);
    let t = 0;
    // kabum.loop(0.7, () => {
    //     // mainCharacter.scale.x = isFlipped ? -SCALE : SCALE;

    //     // Cambiar la dirección de la rotación cada vez
    //     direction *= -1;
    //     // Convertir grados a radianes para la rotación y aplicarla
    //     mainCharacter.angle = -direction * 10;
    //     mainCharacterpos.x += direction * 20;
    // });
    kabum.onUpdate(() => {
        updateParallaxMovement();

        const tiempo = kabum.time() * velocidadBalanceo;

        pendulumPositionAtAngle(tiempo);
        mainCharacter.pos.x = positionCharacter.x;
        mainCharacter.pos.y = positionCharacter.y;
        mainCharacter.angle = positionCharacter.angle;
        rope.pos.x = positionRope.x;
        rope.pos.y = positionRope.y;
        rope.angle = positionRope.angle;
    });
    function pendulumPositionAtAngle(tiempo) {


        let x, y, a;
        a = swingingMax * Math.sin(tiempo);

        // positionRope.vx = x - positionRope.x;
        // positionRope.vy = y - positionRope.y;
        // positionRope.va = a - positionRope.angle;
        // positionRope.x = x;
        // positionRope.y = y;
        positionRope.angle = a;
        if (swinging) {
            x = ROPELENGTH * Math.sin(-positionRope.angle * (Math.PI / 180)) + kabum.width() / 2;
            y = ROPELENGTH * Math.cos(-positionRope.angle * (Math.PI / 180));
            positionCharacter.vx = x - positionCharacter.x;
            positionCharacter.vy = y - positionCharacter.y;
            positionCharacter.x = x;
            positionCharacter.y = y;
            positionCharacter.va = a - positionCharacter.angle;
            positionCharacter.angle = a;

        } else {
            moveCharacter();
        }
    }
    //x y movement using vx and vy
    function moveCharacter() {
        positionCharacter.x += positionCharacter.vx;
        positionCharacter.y += positionCharacter.vy;
        positionCharacter.vy += STARTGRAVITY;
        positionCharacter.angle += positionCharacter.va;
    }
    kabum.add([
        kabum.text("PRESS SPACE TO JUMP", { font: "pixelFont" }),
        kabum.pos(kabum.width() / 2, kabum.height() / 2 + 80),
        kabum.scale(SCALE / 1.8),
        kabum.anchor("center"),
    ]);

    // Parallax background
    const randn_bm = (min, max, skew = 1) => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
        num = Math.pow(num, skew); // Skew
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
        return num;
    }

    function randParallax(min = 0, max = numHorizon) {
        let num = randn_bm(-30, 70, 1);
        while (num < 0 || num > 10) {
            num = randn_bm(-30, 70, 1);
        }
        return Math.round(num); // Redondear el número al entero más cercano
    }
    function addParallax() {

        let frameIndex = kabum.randi(0, 5);
        let far = randParallax(1, numHorizon);
        let par;
        let parallaxColor = 150;
        let horizonSeparation2 = 0;
        for (let i = 1; i < far; i++) {
            horizonSeparation2 += horizonM * SCALE - i * horizonM * SCALE / numHorizon;
        }

        if (frameIndex == 4) {

            par = kabum.add([
                kabum.sprite("cactus2"),
                kabum.scale(SCALE - (far + 2) * SCALE / numHorizon),
                kabum.pos(kabum.width(), kabum.height() - FLOOR_HIGHT - horizonSeparation2),
                kabum.anchor("botleft"),
                "cactus",
                speed(SPEED - (far + 1) * SPEED / numHorizon),
                kabum.color(parallaxColor - far * parallaxColor / numHorizon, parallaxColor - far * parallaxColor / numHorizon, parallaxColor - far * parallaxColor / numHorizon)
            ]);
        } else if (frameIndex < 4) {
            par = kabum.add([
                kabum.sprite("cactus", { frame: frameIndex }),
                kabum.scale(SCALE - (far + 2) * SCALE / numHorizon),
                kabum.pos(kabum.width(), kabum.height() - FLOOR_HIGHT - horizonSeparation2),
                kabum.anchor("botleft"),
                "cactus",
                speed(SPEED - (far + 1) * SPEED / numHorizon),
                kabum.color(parallaxColor - far * parallaxColor / numHorizon, parallaxColor - far * parallaxColor / numHorizon, parallaxColor - far * parallaxColor / numHorizon)
            ]);
        }

        parallax.push(par); // Añadir el cactus al array de cacti
        parallax.length > 1000 && kabum.destroy(parallax.shift());
    }
    function spawnParallax() {
        addParallax();

        kabum.wait(kabum.rand(0.05, 0.2), spawnParallax);
    }
    spawnParallax();
    function updateParallaxMovement() {
        parallax.forEach(par => {

            par.pos.x -= par.getSpeed();

        });
    }





    function speed(sp) {
        let speed = sp;
        return {
            getSpeed() {
                return speed;
            },
            setSpeed(newSpeed) {
                speed = newSpeed;
            },
        }
    }
    //end parallax background

    //START GAME

    kabum.onKeyPress("space", () => {
        stopSwinging();
    });
    kabum.onClick(() => stopSwinging());

    function stopSwinging() {
        swinging = false;
        kabum.wait(1.5, () => {
            kabum.shake();
            kabum.wait(1, () => {
                kabum.destroyAll("dino")
                kabum.destroyAll("face")
                kabum.destroyAll("rope")
                kabum.destroyAll("base")
                // kabum.destroyAll("kabum.text")
                kabum.go("game");
            });
        });
    }
};