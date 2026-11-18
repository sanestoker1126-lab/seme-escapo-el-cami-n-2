#!/usr/bin/env node
'use strict';
/**
 * V58.1 FASE4 — Lossless, source-locked PNG recompression.
 * Recompresses existing IDAT deflate streams only. Never edits color samples,
 * alpha, metadata chunks, atlas coordinates, animation timings, or physics.
 * Uses only Node.js built-ins; default mode is read-only.
 */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');
const MAX_INFLATED_BYTES = 256 * 1024 * 1024;
const GAME = path.resolve(__dirname, '../..');

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, payload) {
  if (!/^[a-zA-Z]{4}$/.test(type)) throw new Error('Invalid PNG chunk type');
  const b = Buffer.allocUnsafe(payload.length + 12);
  b.writeUInt32BE(payload.length, 0);
  b.write(type, 4, 'ascii');
  payload.copy(b, 8);
  b.writeUInt32BE(crc32(b.subarray(4, b.length - 4)), b.length - 4);
  return b;
}
function parsePng(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 45 || !buf.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error('Not a valid PNG signature');
  }
  const chunks = [];
  let pos = 8, end = false;
  while (pos + 12 <= buf.length) {
    const length = buf.readUInt32BE(pos);
    if (length > 256 * 1024 * 1024 || length > buf.length - pos - 12) throw new Error('Truncated/oversized PNG chunk');
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const crc = buf.readUInt32BE(pos + 8 + length);
    const bytes = buf.subarray(pos + 4, pos + 8 + length);
    if (crc32(bytes) !== crc) throw new Error('CRC mismatch: ' + type);
    chunks.push({type, start: pos, end: pos + 12 + length, payload: buf.subarray(pos + 8, pos + 8 + length)});
    pos += 12 + length;
    if (type === 'IEND') {end = true; break;}
  }
  if (!end || pos !== buf.length || chunks[0]?.type !== 'IHDR' || chunks[0].payload.length !== 13) {
    throw new Error('Invalid PNG chunk structure');
  }
  const ihdr = chunks[0].payload;
  const width = ihdr.readUInt32BE(0), height = ihdr.readUInt32BE(4);
  if (!width || !height || width > 32768 || height > 32768) throw new Error('Invalid PNG dimensions');
  const idats = chunks.map((c, i) => ({...c, index: i})).filter(c => c.type === 'IDAT');
  if (!idats.length || idats.some((c, i) => i && c.index !== idats[i-1].index + 1)) {
    throw new Error('Missing or noncontiguous IDAT');
  }
  return {chunks, idats, width, height, bitDepth: ihdr[8], colorType: ihdr[9], interlace: ihdr[12], apng: chunks.some(c => c.type === 'acTL')};
}
function optimizePng(original) {
  const info = parsePng(original);
  if (info.apng) return {buffer: original, savedBytes: 0, skip: 'animated PNG preserved', info};
  const idatBytes = Buffer.concat(info.idats.map(c => c.payload));
  const raw = zlib.inflateSync(idatBytes, {maxOutputLength: MAX_INFLATED_BYTES});
  const strategies = [zlib.constants.Z_DEFAULT_STRATEGY, zlib.constants.Z_FILTERED];
  let deflated = idatBytes;
  for (const strategy of strategies) {
    const b = zlib.deflateSync(raw, {level: 9, memLevel: 9, strategy});
    if (b.length < deflated.length) deflated = b;
  }
  if (deflated === idatBytes) return {buffer: original, savedBytes: 0, skip: 'no smaller lossless stream', info};
  if (!zlib.inflateSync(deflated, {maxOutputLength: MAX_INFLATED_BYTES}).equals(raw)) throw new Error('Raster/alpha mismatch');
  const before = original.subarray(0, info.idats[0].start);
  const after = original.subarray(info.idats[info.idats.length - 1].end);
  const candidate = Buffer.concat([before, chunk('IDAT', deflated), after]);
  parsePng(candidate);
  if (candidate.length >= original.length) return {buffer: original, savedBytes: 0, skip: 'file would not shrink', info};
  return {buffer: candidate, savedBytes: original.length - candidate.length, info};
}
function sha(buffer) {return crypto.createHash('sha256').update(buffer).digest('hex');}
function gatherPng(root, rel, acc) {
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(root + path.sep)) throw new Error('Path outside game: ' + rel);
  if (!fs.existsSync(abs)) return;
  const stat = fs.statSync(abs);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(abs)) gatherPng(root, path.posix.join(rel, name), acc);
  } else if (abs.endsWith('.png')) acc.add(rel);
}
function getTargets(root = GAME, profile = 'runtime') {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/production/character_enemy_section01.json'), 'utf8'));
  const selected = new Set();
  const add = rel => {if (rel && rel.endsWith('.png')) selected.add(rel);};
  for (const enemy of catalog.marine_enemies) add(enemy.atlas);
  add(catalog.characters.sofia.underwater.atlas);
  add(catalog.characters.sofia.underwater.attack_atlas);
  for (const variant of catalog.characters.sofia.arrival.variants) {
    add(variant.atlas);
    add(variant.folder + 'idle_0.png');
    for (let i = 0; i < variant.original_walk_frames; i++) add(variant.folder + 'walk_' + i + '.png');
  }
  const estokerJs = fs.readFileSync(path.join(root, catalog.characters.estoker.module), 'utf8');
  for (const m of estokerJs.matchAll(/"src":"(assets\/cinematic\/estoker_memory\/[^"\s]+\.png)"/g)) add(m[1]);
  for (const cat of catalog.characters.companions) {
    for (let i = 1; i <= cat.idle_frames; i++) add(cat.folder + cat.id + '_idle_v38_0' + i + '.png');
    for (let i = 1; i <= cat.walk_frames; i++) add(cat.folder + cat.id + '_walk_v38_0' + i + '.png');
    add(cat.folder + cat.id + '_shoulder.png');
  }
  if (profile === 'all') {
    for (const folder of ['assets/enemies/marine', 'assets/player/sofia', 'assets/player/sofia_arrival', 'assets/cinematic/estoker_memory', 'assets/companions']) {
      gatherPng(root, folder, selected);
    }
  } else if (profile !== 'runtime') throw new Error('Unknown profile: ' + profile);
  return [...selected].sort();
}
function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help')) {
    process.stdout.write('Usage: node tools/arte/optimize_png_source_locked.js [--profile runtime|all] [--apply] [--report path.json]\nDefault: safe read-only dry run. --apply rewrites only if byte-identical raster/alpha and smaller.\n');
    return;
  }
  const apply = argv.includes('--apply');
  const profile = argv.includes('--profile') ? argv[argv.indexOf('--profile') + 1] : 'runtime';
  const output = argv.includes('--report') ? argv[argv.indexOf('--report') + 1] : null;
  const files = getTargets(GAME, profile);
  const rows = [];
  for (const rel of files) {
    const src = path.resolve(GAME, rel);
    const input = fs.readFileSync(src);
    const {buffer, savedBytes, info, skip} = optimizePng(input);
    if (apply && savedBytes > 0) {
      const tmp = src + '.optimized-' + process.pid + '.tmp';
      try {fs.writeFileSync(tmp, buffer);fs.renameSync(tmp, src);} finally {if (fs.existsSync(tmp)) fs.unlinkSync(tmp);}
    }
    rows.push({path: rel, original_bytes: input.length, optimized_bytes: buffer.length, saved_bytes: savedBytes, width: info.width, height: info.height, color_type: info.colorType, alpha_channel: info.colorType === 4 || info.colorType === 6, source_sha256: sha(input), result_sha256: sha(buffer), action: apply && savedBytes > 0 ? 'APPLIED_LOSSLESS' : savedBytes ? 'AVAILABLE' : 'UNCHANGED', ...(skip ? {note:skip} : {})});
  }
  const report = {schema:'seme-fue-el-camion/visual-assets-lossless-png/v581',mode:apply?'apply':'dry-run',profile,policy:{source_locked:true,no_ai_replacements:true,no_duplicate_atlases:true,protect_alpha:true,protect_original_pixels:true,protect_physics:true},total_files:rows.length,original_bytes:rows.reduce((s,x)=>s+x.original_bytes,0),result_bytes:rows.reduce((s,x)=>s+x.optimized_bytes,0),saved_bytes:rows.reduce((s,x)=>s+x.saved_bytes,0),results:rows};
  if (output) fs.writeFileSync(path.resolve(output), JSON.stringify(report,null,2)+'\n');
  process.stdout.write(JSON.stringify({mode:report.mode,profile,total_files:report.total_files,original_bytes:report.original_bytes,result_bytes:report.result_bytes,saved_bytes:report.saved_bytes,changed:rows.filter(r=>r.saved_bytes>0).length,report:output||null})+'\n');
}
if (require.main === module) {try {main();} catch (e) {console.error('ERROR:',e.message);process.exitCode=1;}}
module.exports = {crc32,chunk,parsePng,optimizePng,getTargets,main};
