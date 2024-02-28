export function gameStart() {
    // Definición de la escena
    const STARTGRAVITY = 0.2;
    const ROPELENGTH = height() / 2;
    let swinging = true;
    direction = 1; // Dirección de la rotación
    let swingingMax = 50; // Grados máximos de inclinación
    let velocidadBalanceo = 2; // Velocidad de balanceo
    //añade cuerda


    let positionRope = { x: width() / 2, y: height() / 3, angle: 0, vx: 0, vy: 0, va: 0 };
    let positionCharacter = { x: width() / 2, y: height() / 3, angle: 0, vx: 0, vy: 0, va: 0 };

    let rope = add([
        rect(2 * SCALE, ROPELENGTH+100),
        // outline(4),
        pos(positionRope.x, positionRope.y),
        anchor("bot"),
        // area({ offset: vec2(0, FLOOR_COLLISION) }),
        // body({ isStatic: true }),
        color(127, 127, 127),
        "rope"
    ]);

    let base = add([
        circle(10 * SCALE),
        pos(width()/2,0),
        anchor("center"),
        color(127, 127, 127),
        "base"
    ]);

    let mainCharacter = add([sprite("miquiDino"), pos(positionRope.x - 4 * SCALE, positionRope.y - 7 * SCALE), scale(SCALE), anchor("center")]);
    let t = 0;
    // loop(0.7, () => {
    //     // mainCharacter.scale.x = isFlipped ? -SCALE : SCALE;

    //     // Cambiar la dirección de la rotación cada vez
    //     direction *= -1;
    //     // Convertir grados a radianes para la rotación y aplicarla
    //     mainCharacter.angle = -direction * 10;
    //     mainCharacter.pos.x += direction * 20;
    // });
    onUpdate(() => {
        const tiempo = time() * velocidadBalanceo;
        
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
        x = ROPELENGTH * Math.sin(-positionRope.angle * (Math.PI / 180)) + width() / 2;
        y = ROPELENGTH * Math.cos(-positionRope.angle * (Math.PI / 180));
        positionRope.vx = x - positionRope.x;
        positionRope.vy = y - positionRope.y;
        positionRope.va = a - positionRope.angle;
        positionRope.x = x;
        positionRope.y = y;
        positionRope.angle = a;
        if (swinging) {
            positionCharacter.x = positionRope.x;
            positionCharacter.y = positionRope.y;
            positionCharacter.vx = positionRope.vx;
            positionCharacter.vy = positionRope.vy;
            positionCharacter.angle = positionRope.angle;
            positionCharacter.va = positionRope.va;
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
    add([
        text("PRESS SPACE TO START", { font: "pixelFont" }),
        pos(width() / 2, height() / 2 + 80),
        scale(1.5),
        anchor("center"),
       

    ]);

    // onKeyPress("space", () => go("game"));
    onKeyPress("space", () => {
        stopSwinging();
    });
    onClick(() => stopSwinging());

    function stopSwinging() {
        swinging = false;
        wait(2.5, () => {
            destroyAll("dino")
            destroyAll("face")
            destroyAll("rope")
            destroyAll("base")
            // destroyAll("text")
            go("game");
        });
    }
}