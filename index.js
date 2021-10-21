const shootingSound = new Audio("./sounds/music_shoooting.mp3");
const heavyWeaponSound = new Audio("./sounds/music_heavyWeapon.mp3");
const hugeWeaponSound = new Audio("./sounds/music_hugeWeapon.mp3");
const gameOverSound = new Audio("./sounds/music_gameOver.mp3");
const killEnemySound = new Audio("./sounds/music_killEnemy.mp3");

//basic environment setup

const canvas = document.createElement("canvas");
document.querySelector(".myGame").appendChild(canvas);

var context = canvas.getContext("2d");
const form = document.querySelector("form");
let difficulty = 2;
const score = document.querySelector(".scoreBoard");
let playerScore = 0;
const heavyWeaponDamage = 20;
const ligthWeaponDamage = 10;
canvas.width = innerWidth;
canvas.height = innerHeight;

//event listener to set difficulty
document.querySelector("input").addEventListener("click", (e) => {
  e.preventDefault();

  form.style.display = "none"; //making form invisible
  score.style.display = "block"; //making score visible
  const userValue = document.getElementById("difficulty").value; //getting uservalue
  //setting difficulty
  switch (userValue) {
    case "easy":
      setInterval(() => {
        spawnEnemy();
      }, 2000);
      difficulty = 5;
      break;
    case "medium":
      setInterval(() => {
        spawnEnemy();
      }, 1400);
      difficulty = 8;
      break;
    case "hard":
      setInterval(() => {
        spawnEnemy();
      }, 1000);
      difficulty = 10;
      break;
    case "insane":
      setInterval(() => {
        spawnEnemy();
      }, 700);
      difficulty = 12;
      break;
  }
});

//game overloader
const gameOverLoader = () => {
  const gameOverBanner = document.createElement("div");
  const gameOverBtn = document.createElement("button");
  const highScore = document.createElement("div");
  gameOverBtn.innerText = "Play Again";
  gameOverBanner.appendChild(highScore);
  gameOverBanner.appendChild(gameOverBtn);

  const oldScore =
    localStorage.getItem("highScore") && localStorage.getItem("highScore");

  if (oldScore < playerScore) {
    localStorage.setItem("highScore", playerScore);
  }

  highScore.innerHTML = `High Score : ${
    localStorage.getItem("highScore")
      ? localStorage.getItem("highScore")
      : playerScore
  }`;

  gameOverBtn.onclick = () => {
    window.location.reload();
  };
  gameOverBanner.classList.add("gameOver");

  document.querySelector("body").appendChild(gameOverBanner);
};

//--------- player , weapen and enemy classes -------------//

//setting player positon
const PLAYERPOSITION = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};
//----------- --  Player class -------------------//
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    context.beginPath();

    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }
}
//----------- --  Weapeon class -------------------//
class Weapon {
  constructor(x, y, radius, color, velocity, damage) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.damage = damage;
  }
  draw() {
    context.beginPath();

    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

//----------- -- Heavy Weapeon class -------------------//
class HugeWeapon {
  constructor(x, y, damage) {
    this.x = x;
    this.y = y;
    this.color = "rgb(126,97,255)";
    this.damage = damage;
  }
  draw() {
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, 200, canvas.height);
    context.fill();
  }
  update() {
    this.draw();
    this.x += 20;
  }
}

//----------- --  Enemy class -------------------//
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    context.beginPath();

    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

//----------- --  Particle class -------------------//
const fraction = 0.98;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    context.beginPath();
    context.save();

    context.globalAlpha = this.alpha;

    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );

    context.fillStyle = this.color;
    context.fill();
    context.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= fraction;
    this.velocity.y *= fraction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

//---- main logic ---------

//-------- creating player object ----//
const paras = new Player(PLAYERPOSITION.x, PLAYERPOSITION.y, 10, "crimson");

// ----- weapon arrray ,enemy , partilces array ------//
const weapons = [];
const hugeWeapons = [];
const enemies = [];
const particles = [];

//--- function to spawn enemy -----//

const spawnEnemy = () => {
  const enemySize = Math.random() * (40 - 5) + 5; // enemey random size between 5 - 40
  let random; // enemy spawn position
  // settng enemy positon

  if (Math.random() < 0.5) {
    // making positon from left and right from outside the screen
    random = {
      x: Math.random() < 0.5 ? 0 - enemySize : canvas.width + enemySize,
      y: Math.random() * canvas.height,
    };
  } else {
    // making positon from top and bottom from outside the screen
    random = {
      x: Math.random() * canvas.width,
      y: Math.random() < 0.5 ? 0 - enemySize : canvas.height + enemySize,
    };
  }
  // creating angle between player position and span enemy position
  const angle = Math.atan2(
    canvas.height / 2 - random.y,
    canvas.width / 2 - random.x
  );
  // seting enemy velocity according to difficulty ---
  const velocity = {
    x: Math.cos(angle) * difficulty,
    y: Math.sin(angle) * difficulty,
  };
  // pushing spawn enemy in the enemies array

  enemies.push(
    new Enemy(
      random.x,
      random.y,
      enemySize,
      `hsl(${Math.floor(Math.random() * 360)},100%,50%)`,
      velocity
    )
  );
};

// ------------- animation function ------------//

let animationId;
function animation() {
  animationId = requestAnimationFrame(animation);
  // fill rect with less opacity
  context.fillStyle = "rgba(49,49,49,0.2)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  paras.draw();
  //generating particels
  particles.forEach((particle, particelIndex) => {
    if (particle.alpha <= 0) {
      particles.splice(particelIndex, 1);
    } else {
      particle.update();
    }
  });

  // generating heavyWeapon
  hugeWeapons.forEach((hugeWeapon, index) => {
    if (hugeWeapon.x > canvas.width) {
      hugeWeapons.splice(index, 1);
    } else {
      hugeWeapon.update();
    }
  });
  // generating weapon
  weapons.forEach((weapon, weaponIndex) => {
    weapon.update();

    // delete weapon if it is outside of window
    if (
      weapon.x + weapon.radius < 1 ||
      weapon.x - weapon.radius > canvas.width ||
      weapon.y + weapon.radius < 1 ||
      weapon.y - weapon.radius > canvas.height
    ) {
      weapons.splice(weaponIndex, 1);
    }
  });

  //generating enemy
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    //calculating distance between player and enemy
    const distBtwPlayerAndEnemy = Math.hypot(
      paras.x - enemy.x,
      paras.y - enemy.y
    );

    // if enemy hit the player the animation gets over
    if (distBtwPlayerAndEnemy - enemy.radius - paras.radius <= 0) {
      cancelAnimationFrame(animationId);
      gameOverSound.play();
      return gameOverLoader();
    }

    hugeWeapons.forEach((heavyWeapon) => {
      const distBtwHeavyWeaponAndEnemy = heavyWeapon.x - enemy.x;

      if (
        distBtwHeavyWeaponAndEnemy <= 200 &&
        distBtwHeavyWeaponAndEnemy >= -200
      ) {
        setTimeout(() => {
          killEnemySound.play();
          enemies.splice(enemyIndex, 1);
        }, 0);
        playerScore += 10;
        score.innerHTML = "Score : " + playerScore;
      }
    });

    weapons.forEach((weapon, weaponIndex) => {
      // calculating distace between weapon and enemy
      const distBtwWeaponAndEnemy = Math.hypot(
        weapon.x - enemy.x,
        weapon.y - enemy.y
      );

      if (distBtwWeaponAndEnemy - enemy.radius - weapon.radius <= 0) {
        //decresing the radius of enemy is it is greater than 18 mens
        //enemy is bigger and require more weapon to get killed;

        if (enemy.radius > weapon.damage + 5) {
          gsap.to(enemy, {
            radius: enemy.radius - weapon.damage,
          });
          setTimeout(() => {
            weapons.splice(weaponIndex, 1);
          }, 0);
        } else {
          // killing enemy with a single weapon

          //burst effect with particles
          for (let i = 0; i < enemy.radius * 2; i++) {
            particles.push(
              new Particle(
                weapon.x,
                weapon.y,
                Math.random() + 1 - 0.5,
                enemy.color,
                {
                  x: (Math.random() - 0.5) * Math.random() * 5,
                  y: (Math.random() - 0.5) * Math.random() * 5,
                }
              )
            );
          }
          //incresing player score on killing
          playerScore += 10;
          score.innerHTML = "Score : " + playerScore;
          setTimeout(() => {
            killEnemySound.play();
            enemies.splice(enemyIndex, 1);
            weapons.splice(weaponIndex, 1);
          }, 0);
        }
      }
    });
  });
}
animation();

//----------------------  event to release light weapon ----------------------------//

canvas.addEventListener("click", (e) => {
  shootingSound.play();
  // angle betten clicked positon and player
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  // velocity of light weapon
  const velocity = {
    x: Math.cos(angle) * 6,
    y: Math.sin(angle) * 6,
  };

  // pusing in weapons array
  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      4,
      "yellow",
      velocity,
      ligthWeaponDamage
    )
  );
});

//----------------------  event to release heavy weapon ----------------------------//

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  //cannot fire heavyweapon if score is 0 or negitive

  if (playerScore <= 0) return;
  heavyWeaponSound.play();

  //decresing player score if heavy weapon is fired
  playerScore -= 10;
  score.innerHTML = "Score : " + playerScore;

  // angle betten clicked positon and player

  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  // velocity of heavy weapon
  const velocity = {
    x: Math.cos(angle) * 3,
    y: Math.sin(angle) * 3,
  };

  // pusing in weapons array

  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      20,
      "cyan",
      velocity,
      heavyWeaponDamage
    )
  );
});

//-------------- event to release huge weapon ---------------//
addEventListener("keypress", (e) => {
  if (e.key == " ") {
    //cannot fire huge weapon if score is less than 20

    if (playerScore < 20) return;
    hugeWeaponSound.play();
    //decresing player score if huge weapon is fired
    playerScore -= 20;
    score.innerHTML = "Score : " + playerScore;

    hugeWeapons.push(new HugeWeapon(0, 0, 100));
  }
});

// ----------- resize canvas -----------------//

addEventListener("resize", () => {
  window.location.reload();
});
