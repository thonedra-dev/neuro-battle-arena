import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#111",
  scene: {
    create,
    update
  }
};

const game = new Phaser.Game(config);

let units = [];

function create() {
  // Create 20 blue units
  for (let i = 0; i < 20; i++) {
    let unit = this.add.circle(
      Phaser.Math.Between(100, 900),
      Phaser.Math.Between(100, 500),
      6,
      0x00aaff
    );

    units.push({
      sprite: unit,
      vx: Phaser.Math.FloatBetween(-1, 1),
      vy: Phaser.Math.FloatBetween(-1, 1)
    });
  }
}

function update() {
  // Move all units
  for (let u of units) {
    u.sprite.x += u.vx;
    u.sprite.y += u.vy;

    // bounce off walls
    if (u.sprite.x < 0 || u.sprite.x > 1000) u.vx *= -1;
    if (u.sprite.y < 0 || u.sprite.y > 600) u.vy *= -1;
  }
}