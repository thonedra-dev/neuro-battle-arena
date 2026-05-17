const COLLIDE_RADIUS = 6;   // unit radius
const MIN_DIST = COLLIDE_RADIUS * 2; // 12

// resolves collisions between all units:
// - same team → bounce apart (no damage)
// - different teams → bounce apart + both take 1 damage (if cooldown allows)
export function resolveCollisions(units) {
  for (let i = 0; i < units.length; i++) {
    const a = units[i];
    if (!a.alive) continue;

    for (let j = i + 1; j < units.length; j++) {
      const b = units[j];
      if (!b.alive) continue;

      const dx = a.sprite.x - b.sprite.x;
      const dy = a.sprite.y - b.sprite.y;
      const dist = Math.hypot(dx, dy);

      if (dist < MIN_DIST) {
        // ---- repulsion (bounce apart) ----
        const angle = Math.atan2(dy, dx);
        const overlap = MIN_DIST - dist;
        const moveX = Math.cos(angle) * overlap * 0.5;
        const moveY = Math.sin(angle) * overlap * 0.5;
        a.sprite.x += moveX;
        a.sprite.y += moveY;
        b.sprite.x -= moveX;
        b.sprite.y -= moveY;

        // ---- enemy damage ----
        if (a.team !== b.team) {
          a.takeDamage(1);
          b.takeDamage(1);
        }
      }
    }
  }
}