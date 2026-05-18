import Phaser from "phaser";
import Unit from "./unit.js";
import { resolveCollisions } from "./CollisionSystem.js";

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
  backgroundColor: "#0a0a1a",
  scene: {
    create,
    update,
  },
};

const game = new Phaser.Game(config);
let units = [];
let sceneRef = null;
let playerControl = true; // set to false for AI vs AI

function create() {
  sceneRef = this;
  const w = this.game.config.width;
  const h = this.game.config.height;

  // ----- BLUE TEAM (BOTTOM - PLAYER/ALLY) -----
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(40, w - 40);
    const y = Phaser.Math.Between(h - 100, h - 50);
    const unit = new Unit(this, x, y, "blue", 1.3, 3, 0x00aaff);
    units.push(unit);
  }

  // ----- RED TEAM (TOP - ENEMY/CPU) -----
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(40, w - 40);
    const y = Phaser.Math.Between(50, 150);
    const unit = new Unit(this, x, y, "red", 1.0, 3, 0xff3355);
    units.push(unit);
  }

  // Optional: add a visual divider line
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0xffffff, 0.3);
  graphics.lineBetween(0, h / 2, w, h / 2);
  
  // Add "territory" labels
  this.add.text(w / 2, 60, "🔴 ENEMY TERRITORY 🔴", {
    fontSize: "14px",
    fill: "#ff3355",
    fontFamily: "Orbitron, monospace",
    align: "center"
  }).setOrigin(0.5).setAlpha(0.7);
  
  this.add.text(w / 2, h - 60, "🔵 YOUR TERRITORY 🔵", {
    fontSize: "14px",
    fill: "#00aaff",
    fontFamily: "Orbitron, monospace",
    align: "center"
  }).setOrigin(0.5).setAlpha(0.7);
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
    if (!unit.alive) continue;
    unit.tickCooldown();
    unit.updateTextPosition();
    remainingUnits.push(unit);
  }
  units = remainingUnits;

  // 5. Update UI counts
  const blueAlive = units.filter(u => u.alive && u.team === "blue").length;
  const redAlive = units.filter(u => u.alive && u.team === "red").length;
  
  const blueCountElem = document.getElementById("blueCount");
  const redCountElem = document.getElementById("redCount");
  if (blueCountElem) blueCountElem.innerText = blueAlive;
  if (redCountElem) redCountElem.innerText = redAlive;

  // 6. Check victory condition
  if (blueAlive === 0 || redAlive === 0) {
    const winner = blueAlive === 0 ? "RED" : "BLUE";
    const victoryOverlay = document.getElementById("victoryOverlay");
    const victoryText = document.getElementById("victoryText");
    if (victoryOverlay && victoryText && !victoryOverlay.classList.contains("show")) {
      victoryText.innerText = `${winner} TEAM VICTORY!`;
      victoryOverlay.classList.add("show");
    }
  }
}

// Optional: restart function (expose globally)
window.restartGame = () => {
  // Clean up existing units
  for (let unit of units) {
    if (unit.sprite) unit.sprite.destroy();
    if (unit.healthText) unit.healthText.destroy();
  }
  units = [];
  
  // Re-create the scene
  const w = sceneRef.game.config.width;
  const h = sceneRef.game.config.height;
  
  // Blue at bottom
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(40, w - 40);
    const y = Phaser.Math.Between(h - 100, h - 50);
    const unit = new Unit(sceneRef, x, y, "blue", 1.3, 3, 0x00aaff);
    units.push(unit);
  }
  
  // Red at top
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(40, w - 40);
    const y = Phaser.Math.Between(50, 150);
    const unit = new Unit(sceneRef, x, y, "red", 1.0, 3, 0xff3355);
    units.push(unit);
  }
  
  // Hide victory overlay
  const victoryOverlay = document.getElementById("victoryOverlay");
  if (victoryOverlay) victoryOverlay.classList.remove("show");
};

// Add restart button listener when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      window.restartGame();
    });
  }
});