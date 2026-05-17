import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#111",
  scene: { create, update }
};

const game = new Phaser.Game(config);

let units = [];

function create() {
  // 🔵 BLUE TEAM
  for (let i = 0; i < 20; i++) {
    let sprite = this.add.circle(
      Phaser.Math.Between(100, 800),
      Phaser.Math.Between(100, 500),
      6,
      0x00aaff
    );

    units.push({
      sprite,
      team: "blue",
      speed: 1.2
    });
  }

  // 🔴 RED TEAM
  for (let i = 0; i < 20; i++) {
    let sprite = this.add.circle(
      Phaser.Math.Between(200, 900),
      Phaser.Math.Between(100, 500),
      6,
      0xff3355
    );

    units.push({
      sprite,
      team: "red",
      speed: 1.0
    });
  }
}

function update() {
  for (let u of units) {
    let target = findNearestEnemy(u);

    if (target) {
      moveTowards(u, target.sprite);
    }

    // keep inside screen bounds
    bounce(u);
  }
}

// 🎯 Find nearest enemy unit
function findNearestEnemy(unit) {
  let closest = null;
  let minDist = Infinity;

  for (let other of units) {
    if (other.team === unit.team) continue;

    let dx = other.sprite.x - unit.sprite.x;
    let dy = other.sprite.y - unit.sprite.y;
    let dist = dx * dx + dy * dy;

    if (dist < minDist) {
      minDist = dist;
      closest = other;
    }
  }

  return closest;
}

// 🧭 Move towards target
function moveTowards(unit, targetSprite) {
  let dx = targetSprite.x - unit.sprite.x;
  let dy = targetSprite.y - unit.sprite.y;

  let length = Math.sqrt(dx * dx + dy * dy);

  unit.sprite.x += (dx / length) * unit.speed;
  unit.sprite.y += (dy / length) * unit.speed;
}

// 🔄 Bounce logic
function bounce(unit) {
  if (unit.sprite.x < 0) unit.sprite.x = window.innerWidth;
  if (unit.sprite.x > window.innerWidth) unit.sprite.x = 0;
  if (unit.sprite.y < 0) unit.sprite.y = window.innerHeight;
  if (unit.sprite.y > window.innerHeight) unit.sprite.y = 0;
}