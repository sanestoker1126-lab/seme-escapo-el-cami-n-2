'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const at = rel => path.join(ROOT, rel);
const json = rel => JSON.parse(fs.readFileSync(at(rel), 'utf8'));
const validFile = rel => assert.ok(fs.statSync(at(rel)).isFile(), rel + ' missing');

test('Sofía v12 source-locked animation manifest references real frames and sources', () => {
  const out = json('assets/player/sofia/animation_manifest_v12.json');
  assert.equal(out.policy.no_ai_replacement, true);
  for (const [key, item] of Object.entries(out.atlases)) {
    validFile(item.image); validFile(item.metadata);
    if (key === 'swim_strike') continue;
    const raw = json(item.metadata);
    assert.equal(Object.keys(raw.frames).length, item.frame_count);
    assert.deepEqual(Object.keys(item.states), Object.keys(raw.animations));
    for (const [name, state] of Object.entries(item.states)) {
      assert.deepEqual(state.frame_ids, raw.animations[name].frames);
      assert.ok(state.frame_ids.every(id => Object.hasOwn(raw.frames, id)), name);
    }
  }
  const strike = out.atlases.swim_strike;
  const base = json(out.atlases.diver.metadata);
  assert.equal(strike.frame_count, 11);
  assert.ok(strike.source_frame_ids.every(id => Object.hasOwn(base.frames, id)));
  assert.equal(out.atlases.complementary.runtime_enabled, false);
  assert.equal(out.qa.visual_transitions, 'NOT_TESTED');
});

test('Sofía arrival source-locked manifest references existing PNG and correct source coordinates', () => {
  const catalog = json('assets/player/sofia_arrival/manifest_source_locked_v581.json');
  assert.deepEqual(Object.keys(catalog.variants), ['original', 'rosa', 'uniforme']);
  for (const item of Object.values(catalog.variants)) {
    const prefix = catalog.base_directory;
    validFile(prefix + item.atlas);
    validFile(prefix + item.metadata);
    validFile(prefix + item.idle_png);
    const raw = json(prefix + item.metadata);
    assert.equal(raw.frames.length, 12);
    assert.deepEqual(raw.animations, item.animations);
    for (let i=0;i<12;i++) {
      assert.deepEqual(raw.frames[i].frame, {x:i*320,y:0,w:320,h:320});
      assert.deepEqual(raw.frames[i].pivot, {x:0.5,y:0.9625});
    }
    for (const n of item.walk_frame_indices) validFile(prefix + item.walk_frame_pattern.replace('{index}', n));
  }
  assert.equal(catalog.legacy_manifest_policy, 'PRESERVED_UNCHANGED');
});
