/* V58.1 marine motion adapter: normalized walk cycles and background pan.
   Pure helpers; no DOM, physics, assets, or gameplay state are modified. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.CAMION_MARINE_MOTION = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  function clamp01(value) {
    return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  }

  function smoothStep(value) {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  }

  function actorMotion(elapsedMs, durationMs, distancePx, enabled = true, stepMs = 180, frames = 6) {
    const elapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
    const duration = Math.max(0, Number.isFinite(durationMs) ? durationMs : 0);
    const distance = Math.max(0, Number.isFinite(distancePx) ? distancePx : 0);
    const active = !!enabled && duration > 0;
    const progress = active ? smoothStep(elapsed / duration) : 0;
    const moving = active && elapsed < duration;
    const frameCount = Math.max(1, Math.floor(frames) || 1);
    const frameDuration = Math.max(1, Number.isFinite(stepMs) ? stepMs : 180);
    return Object.freeze({
      moving,
      frame: moving ? Math.floor(elapsed / frameDuration) % frameCount : 0,
      offset: distance * progress,
      progress
    });
  }

  function frameAtPhase(animation, elapsedMs, cycleMs) {
    if (!animation || !Array.isArray(animation.frames) || !animation.frames.length) return null;
    const duration = animation.frames.reduce((sum, frame) => sum + Math.max(0, Number(frame.ms) || 0), 0);
    const cycle = Math.max(1, Number.isFinite(cycleMs) ? cycleMs : duration);
    if (duration <= 0) return animation.frames[0].src || null;
    const elapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
    let p = ((elapsed % cycle) + cycle) % cycle / cycle * duration;
    for (const frame of animation.frames) {
      const ms = Math.max(0, Number(frame.ms) || 0);
      if (p < ms) return frame.src;
      p -= ms;
    }
    return animation.frames[animation.frames.length - 1].src || null;
  }

  function backgroundPan(actorOffset, factor = 0.38) {
    const offset = Math.max(0, Number.isFinite(actorOffset) ? actorOffset : 0);
    const ratio = Math.max(0, Math.min(1, Number.isFinite(factor) ? factor : 0));
    return -offset * ratio;
  }

  function actorSafeWidth(stageWidth, padding, walkDistance) {
    const width = Math.max(1, Number.isFinite(stageWidth) ? stageWidth : 1);
    const pad = Math.max(0, Number.isFinite(padding) ? padding : 0);
    const distance = Math.max(0, Number.isFinite(walkDistance) ? walkDistance : 0);
    const travelReserve = Math.min(width * 0.18, width * distance);
    return Math.max(1, width - pad * 2 - travelReserve);
  }

  return Object.freeze({ actorMotion, frameAtPhase, backgroundPan, actorSafeWidth, smoothStep });
});
