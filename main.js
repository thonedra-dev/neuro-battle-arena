import Phaser from "phaser";
import { resolveCollisions } from "./CollisionSystem.js";
import Unit from "./Unit.js";

// ---------- Helper: find nearest enemy ----------
function findNearestEnemy(unit, allUnits) {
  let closest = null;
  let minDistSq = Infinity;

  for (let other of allUnits) {
    if (!other.alive) continue;
    if (other.team === unit.team) continue;

    const dx = other.sprite.x - unit.sprite.x;
    const dy = other.sprite.y - unit.sprite.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < minDistSq) {
      minDistSq = distSq;
      closest = other;
    }
  }
  return closest;
}

// move unit one step towards target
function moveTowards(unit, targetSprite) {
  const dx = targetSprite.x - unit.sprite.x;
  const dy = targetSprite.y - unit.sprite.y;
  const length = Math.hypot(dx, dy);
  if (length < 0.01) return;
  unit.sprite.x += (dx / length) * unit.speed;
  unit.sprite.y += (dy / length) * unit.speed;
}

// toroidal wrap (teleport to opposite edge)
function wrapUnit(unit, width, height, radius = 6) {
  if (unit.sprite.x < -radius) unit.sprite.x = width + radius;
  if (unit.sprite.x > width + radius) unit.sprite.x = -radius;
  if (unit.sprite.y < -radius) unit.sprite.y = height + radius;
  if (unit.sprite.y > height + radius) unit.sprite.y = -radius;
}

// ---------- Phaser Scene ----------
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#111",
  scene: {
    create,
    update,
  },
};

const game = new Phaser.Game(config);
let units = [];        // array of Unit objects
let sceneRef = null;   // to access width/height in update

function create() {
  sceneRef = this;
  const w = this.game.config.width;
  const h = this.game.config.height;

  // ----- BLUE TEAM (left side) -----
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(50, w / 2 - 50);
    const y = Phaser.Math.Between(50, h - 50);
    const unit = new Unit(this, x, y, "blue", 1.2, 3, 0x00aaff);
    units.push(unit);
  }

  // ----- RED TEAM (right side) -----
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(w / 2 + 50, w - 50);
    const y = Phaser.Math.Between(50, h - 50);
    const unit = new Unit(this, x, y, "red", 1.0, 3, 0xff3355);
    units.push(unit);
  }
}

function update() {
  if (!sceneRef) return;
  const w = sceneRef.game.config.width;
  const h = sceneRef.game.config.height;

  // 1. move each unit towards its nearest enemy
  for (let unit of units) {
    if (!unit.alive) continue;
    const target = findNearestEnemy(unit, units);
    if (target) {
      moveTowards(unit, target.sprite);
    }
  }

  // 2. resolve all collisions (bouncing + damage)
  resolveCollisions(units);

  // 3. edge wrap (toroidal)
  for (let unit of units) {
    if (!unit.alive) continue;
    wrapUnit(unit, w, h, 6);
  }

  // 4. update cooldowns, health text positions, and remove dead units
  const remainingUnits = [];
  for (let unit of units) {
    if (!unit.alive) {
      // already destroyed by Unit.destroy()
      continue;
    }
    unit.tickCooldown();
    unit.updateTextPosition();
    remainingUnits.push(unit);
  }
  units = remainingUnits;

  // optional: small win condition (stop when only one team left)
  const blueAlive = units.some(u => u.alive && u.team === "blue");
  const redAlive = units.some(u => u.alive && u.team === "red");
  if (!blueAlive || !redAlive) {
    // you can show text here if you like
  }
}