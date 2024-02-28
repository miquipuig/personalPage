import kaboom from "kaboom"
import { gameStart } from "game.js";

// kaboom()

kaboom({
    global: true,
    fullscreen: true,
    font: "sans-serif",
    // width: 320,
    // height: 240,
    scale: 1,
    debug: true,
    background: [255, 255, 255, 0],
    root: document.getElementById('jueguito'), // Especifica el contenedor del juego
    // width: 600, // Ancho del canvas, asegúrate de que coincida con el contenedor
    // height: 400, // Alto del canvas, asegúrate de que coincida con el contenedor
    // Puedes añadir aquí más configuraciones según necesites
})

// clearColor(0, 0, 0, 1)
// document.body.style.backgroundColor = "red";
// setGravity(2400)
// loadBean()
// const player = add([
//     sprite("bean"),  // renders as a sprite
//     pos(120, 80),    // position in world
//     area(),          // has a collider
//     body(),          // responds to physics and gravity
// ])

// onKeyPress("space", () => {
//     // .jump() is provided by the body() component
//     player.jump()
// })

// add([
// 	pos(120, 80),
// 	sprite("bean"),
// ])
const FLOOR_HEIGHT = 4;
const SCALE = 2.5;
const FLOOR_HIGHT = 100;
const FLOOR_COLLISION = 30;
const JUMP_FORCE = 1700;
const GRAVITY = 4000;
let SPEED = 10;
loadFont("pixelFont", "fonts/Minecraft.ttf");

loadSpriteAtlas("sprites/miquiDino.png", {
    "miquiDino": {
        x: 0,
        y: 0,
        width: 192,
        height: 64,
        sliceX: 3,
        anims: {
            idle: 0,
            run: { from: 1, to: 2, speed: 10, loop: true },
            jump: 2,
        },

    }
});

loadSpriteAtlas("sprites/boom.png", {
    "boom": {
        x: 0,
        y: 0,
        width: 1216,
        height: 93,
        sliceX: 19,
        anims: {
            boom: { from: 0, to: 18, speed: 19 },
        },

    }
});



loadSpriteAtlas("sprites/miquiCactus.png", {
    "cactus": {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        sliceX: 4,
    }
});
loadSpriteAtlas("sprites/miquiCactus.png", {
    "cactus2": {
        x: 100,
        y: 0,
        width: 50,
        height: 50
    }
});


loadSprite("face", "sprites/miquiFace.png")

scene("game", () => {
    let player;
    let lives = 4;
    let livesSprites = []; // Array para almacenar los sprites de las vidas
    let respawnTime = RespawnTime();
    function showLives() {

        for (let i = 0; i < lives - 1; i++) {
            const lifeSprite = add([
                sprite("miquiDino"),
                pos(80 + 60 * i, 40),
                scale(SCALE / 2),
                rotate(30),
                color(255, 255, 255),
            ]);

            livesSprites.push(lifeSprite); // Añade el sprite al array
        }
    }
    showLives();
    // define gravity
    setGravity(GRAVITY);

    // add a game object to screen
    // floor
    add([
        rect(width(), FLOOR_HEIGHT),
        // outline(4),
        pos(0, height() - FLOOR_HIGHT),
        anchor("botleft"),
        area({ offset: vec2(0, FLOOR_COLLISION) }),
        body({ isStatic: true }),
        color(127, 127, 127),
        "floor"
    ]);


    addPlayer();
    function addPlayer() {
        player = add([
            // list of components
            sprite("miquiDino"),
            pos(80, 40),
            scale(SCALE, SCALE),
            area({
                offset: vec2(12, 3),
                shape: new Polygon([vec2(0), vec2(32, 0), vec2(25, 52), vec2(5, 52)]),
            }),
            body(),
        ]);
        onColide();
        player.onCollide("floor", () => {
            console.log("floor");
            player.play("run");
        });
    }




    function jump() {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
            player.play("jump");
        }
    }

    // jump when user press space
    onKeyPress("space", jump);
    onClick(jump);
    let cacti = [];
    let moving = true;

    function addCactus() {
        let cactus;
        let frameIndex = randi(0, 5);
        if (frameIndex == 4) {
            cactus = add([
                sprite("cactus2"),
                scale(SCALE, SCALE),
                area({ shape: new Polygon([vec2(2), vec2(48, 0), vec2(46, -45), vec2(4, -45)]) }),
                pos(width(), height() - FLOOR_HEIGHT - FLOOR_HIGHT + FLOOR_COLLISION),
                anchor("botleft"),
                // move(LEFT, SPEED),
                "cactus",
                speed()
            ]);
        } else {
            cactus = add([
                sprite("cactus", { frame: frameIndex }),
                scale(SCALE, SCALE),
                area({ shape: new Polygon([vec2(2), vec2(23, 0), vec2(21, -45), vec2(4, -45)]) }),
                pos(width(), height() - FLOOR_HEIGHT - FLOOR_HIGHT + FLOOR_COLLISION),
                anchor("botleft"),
                // move(LEFT, SPEED),
                "cactus",
                speed()
            ]);
        }
        cacti.push(cactus); // Añadir el cactus al array de cacti
        cacti.length > 5 && destroy(cacti.shift());
    }

    function speed() {
        let speed = SPEED;
        return {
            getSpeed() {
                return speed;
            },
            setSpeed(newSpeed) {
                speed = newSpeed;
            },
        }
    }




    function spawnCactus() {
        if (moving) {
            addCactus();
        }

        wait(respawnTime.getRandom(), spawnCactus);
    }
    spawnCactus();

    function RespawnTime() {
        let factor = 1;
        return {
            setRespawnFactor(factor2) {
                factor = factor2;
            },
            getRandom() {
                let random = rand(factor, 3.5 * factor);
                return random;
            },
            getFactor() {
                return factor;
            }
        }
    }



    //stop all cacti elements
    function updateCactiMovement() {
        cacti.forEach(cactus => {
            if (moving) {
                cactus.pos.x -= cactus.getSpeed();
            }
        });
    }

    function setCactiSpeed(speed) {
        SPEED = speed;
        cacti.forEach(cactus => {
            cactus.setSpeed(speed);
        });
    }

    function stopCacti() {
        moving = false; // Cambia el estado para detener el movimiento
    }
    function addBoom(x, y) {
        let boom = add([
            sprite("boom"),
            anchor("center"),
            pos(x, y),
            scale(SCALE),
            "boom",
        ]);
        boom.play("boom", {
            loop: false
        });

        wait(1, () => {
            destroy(boom);
        });
    }
    // lose if player collides with any game obj with tag "cactus"
    function onColide() {
        player.onCollide("cactus", () => {
            lives--;
            // Destruye el sprite de la vida

            addBoom(player.pos.x + 34 * SCALE, player.pos.y + 20 * SCALE);
            if (lives > 0) {
                stopCacti();
                destroy(player);
                wait(2, () => {

                    livesSprites[lives - 1].destroy();

                    addPlayer();
                    moving = true;
                });
            } else {
                go("lose", score);
            }
        });
    }


    // keep track of score
    let score = 0;

    const scoreLabel = add([
        text('- ' + score + ' -', { font: "pixelFont" }),
        pos(24, 24),
    ]);

    function velocityUp() {
        setCactiSpeed(SPEED * 1.05);
    }
    function respawnUp() {
        respawnTime.setRespawnFactor(respawnTime.getFactor() * 0.95);
    }

    // increment score every frame
    onUpdate(() => {
        updateCactiMovement();
        score++;
        scoreLabel.text = score;
        if (score % 500 === 0) {
            respawnUp();
        } else if (score % 2000 === 0) {
            velocityUp();
        }
    });
});

scene("lose", (score) => {


    // display score
    add([
        text(score, { font: "pixelFont" }),
        pos(width() / 2, height() / 2 + 80),
        scale(2),
        anchor("center"),

    ]);
    const loseMessages = [
        "You're no pro at this, that's for sure.",
        "Oops! Did your cat walk on the keyboard?",
        "Maybe try again, this time with your eyes open?",
        "Are you playing with your feet? Just asking!",
        "Legend says you'll win... someday.",
        "Was that really your best effort?",
        "You're breaking records! ...for the most losses.",
        "Is it lag, or is it just your skills?",
        "Game Over! Or was it just a practice run?",
        "On the bright side, you're getting really good at losing.",
        "Press space to continue pretending you have a chance",
        "Your dedication to finding all possible ways to lose is commendable.",
        "Don't worry, we're all winners here. Just some are more winnery than others.",
        "Your gaming skill is like a fine wine; it needs years to develop.",
        "Keep calm and blame it on the game's physics.",
        "You're not losing; you're just giving everyone else a chance to feel good.",
        "Congratulations! You've just discovered yet another way to lose.",
        "Winning is overrated anyway. Let's focus on participation."
    ];

    const middleMessage = [
        "You're not terrible, the game is just extra hard. Yeah, let's go with that.",
        "Congratulations on making it halfway! The rest is just a minor detail, right?",
        "You're halfway to legend status. Now, just the other half to go!",
        "Impressive...ish. You've mastered the art of almost getting there.",
        "Not quite at the finish line, but at least you found the starting line!",
        "You're walking the tightrope between success and... almost success.",
        "You've got the appetizer down; now for the main course!",
        "You're the king of almost-there. All hail the monarch of perpetual misses!",
        "You've passed the tutorial with flying colors. Now, onto the real game..."

    ];

    const winMessages = [
        "You're a winner! Or at least, you're not a loser.",
        "Impressive! Your skills have finally caught up with your confidence.",
        "You did it! You're officially the best at this game.",
        "Congratulations! You've just won the game. Now what?",
        "Champion status achieved! Was it skill, or did the game just take pity on you?",
        "Look at you, winning and all! Did you finally read the instructions, or was it pure luck?",
        "You've surpassed all expectations! Mainly because they were so low to begin with.",
        "Masterful performance! It's almost like you knew what you were doing this time",
        "You conquered the challenge! Should we check if someone was playing for you?"
    ];


    // Función para obtener una frase aleatoria
    // Función para obtener una frase aleatoria y ajustarla si es muy larga
    function getRandomLoseMessageAdjusted() {
        let messages;
        if (score > 7000) {
            messages = middleMessage;
            faceAlmostWin();
        } else if (score > 15000) {
            messages = winMessages;
        } else {
            messages = loseMessages
            faceLose();
        }

        const randomIndex = Math.floor(Math.random() * messages.length);
        let message = messages[randomIndex];
        const maxLineLength = 30; // Ajusta este valor a la longitud máxima deseada por línea

        // Función para dividir el mensaje en varias líneas si es necesario
        function splitMessageIntoLines(str, maxLength) {
            let result = [];
            let currentLine = '';

            str.split(' ').forEach(word => {
                if ((currentLine + word).length <= maxLength) {
                    currentLine += `${word} `;
                } else {
                    result.push(currentLine.trim());
                    currentLine = `${word} `;
                }
            });

            // Añadir lo que queda si no está vacío
            if (currentLine.trim()) {
                result.push(currentLine.trim());
            }

            return result.join('\n');
        }

        // Ajustar el mensaje si es necesario
        if (message.length > maxLineLength) {
            message = splitMessageIntoLines(message, maxLineLength);
        }

        return message;
    }

    // Usar la función ajustada al añadir el texto
    function addMessageInLines(message) {
        let lines = message.split('\n');

        lines.forEach((line, index) => {
            add([
                text(line, { font: "pixelFont" }),
                scale(SCALE),
                pos(width() / 2, height() / 2 + 50 * SCALE + SCALE * 10 * index),
                scale(SCALE * 0.3),
                anchor("center"),
            ]);
        });

    }
    addMessageInLines(getRandomLoseMessageAdjusted());
    //funcion que dado un índice devuelve un numero menor cuando mayor es el indice pero que siempre da dos valores seguidos iguales. Cuando el indice es 0 el valor es el mayor posible 1 y luego va decreciendo dividiendo 1 por el emento siguiente
    function decreaseSize(index) {
        // Calcula el exponente basado en el índice.
        // Cada dos índices, el exponente disminuye en 1 (ej. 0→0, 1-2→-1, 3-4→-2, etc.)
        if (index === 0) {
            return 1; // Retorna 1 para el índice 0.
          } else {
            // Para índices 1 y 2, n = 3. Para índices 3 y 4, n = 4, y así sucesivamente.
            // Calculamos el valor de n sumando 3 al resultado de dividir el índice por 2 y redondear hacia abajo.
            const n = Math.floor(index / 2) + 3;
            return 2 / n; // Retorna 2 dividido por n.
          }
      }

    function alternateEvenOddIndex(index) {
        // Base case for index 0
        if (index === 0) return 0;
      
        // Calculate the base number and ensure it's even
        let baseNumber = Math.ceil(index / 2) * 2;
      
        // Alternate the sign based on whether the index is even or odd
        // Even indices get a positive sign, odd indices get negative
        let sign = index % 2 === 0 ? 1 : -1;
      
        return baseNumber * sign;
      }
      
     
    function alternarNumerosParImpar(indice) {
        // Caso base para el índice 0
        if (indice === 0) return 0;
      
        // Calculamos el número base y aseguramos que sea par
        let numeroBase = Math.ceil(indice / 2) * 2;
      
        // Alternamos el signo basándonos en si el índice es par o impar
        // Los índices pares obtienen un signo positivo, los impares negativo
        let signo = indice % 2 === 0 ? 1 : -1;
      
        return numeroBase * signo;
      }
    function faceAlmostWin() {
        let faces = [];
        let face
        for (let i = 9; i >=0; i--) {
            //devuelve -1 si es impar y +1 si es par
            
            face = add([
                sprite("face"),
                pos(width() / 2 + (alternateEvenOddIndex(i) * SCALE  * 25)*decreaseSize(i+1) + 2 * SCALE, height() / 2),
                scale(SCALE*decreaseSize(i+1)),
                anchor("bot"),
                "face"
            ]);
            faces.push(face);
        }
        angle = 0
        vx = -1;
        onUpdate(() => {
            angle += 1;
            //cambiar pos x para todas las caras
            faces.forEach(face => {
                face.pos.x += vx;
            });
        
        });

        count = 0
        loop(0.2, () => {
   
            //tiro una moneda al aire usando rand
            if(randi(0, 2) === 1){

                size=rand(0.5,1)
                let dino= add([
                    sprite("miquiDino"),
                    pos(0, height() *9/ 10+size*SCALE*30),
                    scale(SCALE*size),
                    anchor("bot"),
                    move(RIGHT, randi(400,600)),
                    "dino"
                ]);
                dino.play("run");
            }
        });



        loop(0.6, () => {
        
            //Si count es impar
            if (count % 2 == 1) {
                
                vx *= -1;
                ///cambiar la escala de todas las caras
                faces.forEach(face => {
                    face.scale.x = -face.scale.x;
                });
            }
            count++;


        });
    }

    function faceLose() {
        const face = add([
            sprite("face"),
            pos(width() / 2 + 10, height() / 2),
            scale(SCALE),
            anchor("bot"),
            rotate(5),
            "face"

        ]);
        let isFlipped = false;

        let direction = 1; // Dirección de la rotación
        loop(0.7, () => {
            isFlipped = !isFlipped;
            face.scale.x = isFlipped ? -SCALE : SCALE;

            // Cambiar la dirección de la rotación cada vez
            direction *= -1;
            // Convertir grados a radianes para la rotación y aplicarla
            face.angle = -direction * 10;
            face.pos.x += direction * 20;
        });
    }
    // go back to game with space is pressed
    onKeyPress("space", () => go("game"));
    onClick(() => go("game"));
});
scene("game",   gameStart);

go("start");