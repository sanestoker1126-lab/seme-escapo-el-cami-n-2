// Import as module, HTML5 Canvas 2D.
export class SofiaDiverAnimator {
  constructor(image, manifest, animation = 'idle') {
    this.image = image;
    this.meta = manifest;
    this.animation = animation;
    this.timeMs = 0;
    this.index = 0;
  }
  setAnimation(name) {
    if (!this.meta.animations[name]) throw new Error(`Unknown animation: ${name}`);
    if (this.animation !== name) { this.animation = name; this.timeMs = 0; this.index = 0; }
  }
  update(dtMs) {
    const anim = this.meta.animations[this.animation];
    const time = Math.max(1, anim.frameDurationMs);
    this.timeMs += Math.max(0, dtMs);
    while (this.timeMs >= time) {
      this.timeMs -= time;
      this.index = anim.loop ? (this.index + 1) % anim.frames.length : Math.min(this.index + 1, anim.frames.length - 1);
    }
  }
  draw(ctx, x, y, scale = 1, flipX = false) {
    const anim = this.meta.animations[this.animation];
    const item = this.meta.frames[anim.frames[this.index]];
    const r = item.frame, src = item.spriteSourceSize, full = item.sourceSize, p = item.pivot;
    ctx.save();
    ctx.translate(x, y);
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(this.image, r.x, r.y, r.w, r.h,
      (src.x - full.w * p.x) * scale, (src.y - full.h * p.y) * scale,
      r.w * scale, r.h * scale);
    ctx.restore();
  }
}
// Usage:
// const [img, meta] = await Promise.all([loadImage('sofia_buceadora_movimientos_rgba.png'), fetch('sofia_buceadora_movimientos.json').then(r=>r.json())]);
// const sofia = new SofiaDiverAnimator(img, meta);
// sofia.setAnimation('nadar_derecha'); sofia.update(16.67); sofia.draw(ctx, player.x, player.y);
