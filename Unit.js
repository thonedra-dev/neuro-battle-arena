export default class Unit {
  constructor(scene, x, y, team, speed, health, color) {
    this.scene = scene;
    this.team = team;
    this.speed = speed;
    this.health = health;
    this.maxHealth = health;
    this.damageCooldown = 0;
    this.alive = true;

    // visual circle
    this.sprite = scene.add.circle(x, y, 6, color);

    // health indicator (text below the unit)
    this.healthText = scene.add.text(x, y + 12, health.toString(), {
      fontSize: "10px",
      fill: "#ffffff",
      fontFamily: "monospace",
    });
    this.healthText.setOrigin(0.5);
  }

  // called when hit by an enemy
  takeDamage(amount) {
    if (!this.alive) return false;
    if (this.damageCooldown > 0) return false;

    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      return true; // unit died
    }
    this.damageCooldown = 15; // frames before next hit
    this.updateHealthDisplay();
    return false;
  }

  updateHealthDisplay() {
    this.healthText.setText(this.health.toString());
  }

  // move health text to follow the unit
  updateTextPosition() {
    if (!this.alive) return;
    this.healthText.setPosition(this.sprite.x, this.sprite.y + 12);
  }

  // reduce cooldown each frame
  tickCooldown() {
    if (this.damageCooldown > 0) this.damageCooldown--;
  }

  destroy() {
    this.alive = false;
    this.sprite.destroy();
    this.healthText.destroy();
  }
}