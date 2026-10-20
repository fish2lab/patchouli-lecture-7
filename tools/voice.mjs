// 配音：小米 MiMo TTS v2.5 把全片台词合成成语音 → src/voice-data.js（第 7 集起；油库里版是 tools/voice-aquestalk.mjs）。
//   MIMO_API_KEY=… node tools/voice.mjs [--list] [--only 台词片段] [--redo]
//   MIMO_API_KEY=… node tools/voice.mjs --design 角色 [--n 3]   重新设计这个角色的音色，候选写到 out/voice-design/
// 做法：每个角色一份参考音色 tools/voices/<角色>.mp3。它是用 mimo-v2.5-tts-voicedesign 按 VOICES 里的描述设计出来的
// （挑一条满意的候选，复制过去）；之后每句都用 mimo-v2.5-tts-voiceclone 照这份音色念，八十句听起来是同一个人。
// 台词放 assistant 消息，这句的语气（角色底色 + mood）写在 user 消息里。不在台词里加「(风格)」标签：clone 模型会把标签后面念坏。
// 念不准的英文词在 SAY 里换成好念的写法，只改送去合成的字，字幕不变。
// 合成结果缓存在 out/voice-cache/（按 模型 + 参考音色 + 语气 + 文字 取哈希），改一句只重合成这一句；--redo 连缓存一起重来。
// 后期：按角色变速（tempo），切掉首尾静音，按有声部分的响度对齐到 TARGET_DB（峰值不超过 -1 dB），编成 24 kHz 单声道 MP3；再算 30fps 响度包络给角色张嘴。
// 平台对每个账号限并发，这里一句一句串行请求，遇到 429 退避重试。MiMo TTS 现在限时免费，key 只从环境变量读，不进仓库。
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { openFilm, ROOT } from './browser.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const has = k => process.argv.includes('--' + k);
const FF = process.env.FFMPEG || 'ffmpeg', API = 'https://api.xiaomimimo.com/v1/chat/completions', KEY = process.env.MIMO_API_KEY;
const SR = 24000, TARGET_DB = -16, PEAK = .89;

// 角色：design 是音色描述（只在 --design 时用），sample 是设计音色时念的那段话；style 是每句都带上的语气底色；
// tempo 是后期变速（ffmpeg atempo，不变调）：MiMo 念得比油库里慢，整片按 8 分钟版收一点，控制在 1.1 以内
const VOICES = {
  ran: {
    design: '知性冷静的年轻女性，声音清亮干练、略低沉，思路极快、条理分明，讲解时不紧不慢却很笃定，像一位擅长推演和计算的参谋在复盘方案。语速中等，重音落在关键词上，句尾干脆收住。',
    sample: '大多数 harness 里，它是写死的。在 DSH 里，它也只是一个插件。第一步，先把这一圈拆开来看。',
    style: '在给懂行的朋友讲解技术：语气平和笃定、条理清楚，像聊天一样自然，语速中等偏快。', tempo: 1.1 },
  patchouli: {
    design: '体弱、文静的少女，声音软糯偏轻，带一点鼻音和气息感，像刚从书堆里抬起头，懒洋洋地问问题，语气里有一点不耐烦又有一点好奇。语速慢。',
    sample: 'ReAct 那种「想一步、做一步」的循环呢？……这一圈本身，是谁写死的？',
    style: '在向讲解的人提问：声音轻、语气平淡，带一点慵懒和好奇，语速中等。', tempo: 1.05 },
};
const MOODS = { happy: '带一点轻快的笑意', proud: '从容笃定，带一点得意', awkward: '有点无奈', surprised: '有点意外', smug: '带一点调侃',
  annoyed: '略带不满地追问', flustered: '有点着急', smile: '轻松满足', sad: '有点低落' };
// 念不准的词 → 送去合成的写法
const SAY = {};
const SAY_RE = Object.keys(SAY).length ? new RegExp(Object.keys(SAY).sort((a, b) => b.length - a.length).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g') : null;
const say = t => SAY_RE ? t.replace(SAY_RE, m => SAY[m]) : t;

// ---- MiMo 请求 ----
async function tts(model, text, user, voice) {
  const messages = [...(user != null ? [{ role: 'user', content: user }] : []), { role: 'assistant', content: text }];
  const body = JSON.stringify({ model, messages, audio: { format: 'wav', ...(voice ? { voice } : {}) } });
  for (let k = 0; ; k++) {
    let r, msg;
    try { r = await fetch(API, { method: 'POST', headers: { 'api-key': KEY, 'Content-Type': 'application/json' }, body, signal: AbortSignal.timeout(180e3) });
      if (r.ok) { const d = await r.json(); return Buffer.from(d.choices[0].message.audio.data, 'base64'); }
      msg = `${r.status} ${(await r.text()).slice(0, 200)}`; } catch (e) { msg = e.message; }
    if (k >= 6 || (r && r.status < 500 && r.status !== 429)) throw new Error(`MiMo 请求失败：${msg}`);
    console.warn(`  重试 ${k + 1}：${msg.split('\n')[0]}`); await new Promise(f => setTimeout(f, 2000 * 2 ** k));
  }
}

// ---- 声音处理 ----
const wavPcm = wav => { let o = 12; while (o < wav.length - 8) { const id = wav.toString('ascii', o, o + 4), n = wav.readUInt32LE(o + 4); if (id === 'data') return new Int16Array(wav.buffer.slice(wav.byteOffset + o + 8, wav.byteOffset + o + 8 + (n & ~1))); o += 8 + n; } throw new Error('不是 WAV'); };
const toF32 = (buf, tempo = 1) => { const raw = execFileSync(FF, ['-v', 'error', '-i', '-', ...(tempo !== 1 ? ['-af', `atempo=${tempo}`] : []), '-f', 's16le', '-ac', '1', '-ar', String(SR), '-'], { input: buf, maxBuffer: 1 << 28 }); return Float32Array.from(new Int16Array(raw.buffer, raw.byteOffset, raw.length >> 1), v => v / 32768); };
const frameDb = (x, hop) => { const out = []; for (let i = 0; i + hop <= x.length; i += hop) { let s = 0; for (let j = i; j < i + hop; j++) s += x[j] * x[j]; out.push(10 * Math.log10(s / hop + 1e-12)); } return out; };
// 切首尾静音（前留 60 ms、后留 150 ms），响度对齐，峰值封顶
function polish(x) {
  const hop = SR / 100, db = frameDb(x, hop), top = Math.max(...db), on = db.map((v, i) => v > top - 38 ? i : -1).filter(i => i >= 0);
  const a = Math.max(0, (on[0] - 6) * hop), b = Math.min(x.length, (on.at(-1) + 16) * hop), y = x.slice(a, b);
  const act = frameDb(y, hop).filter(v => v > top - 30), rms = 10 * Math.log10(act.reduce((s, v) => s + 10 ** (v / 10), 0) / act.length);
  let peak = 0; for (const v of y) peak = Math.max(peak, Math.abs(v));
  const g = Math.min(10 ** ((TARGET_DB - rms) / 20), PEAK / peak);
  // 头尾 10 ms 淡入淡出，免得切口咔哒一声
  const f = SR / 100; for (let i = 0; i < y.length; i++) y[i] *= g * Math.min(1, i / f, (y.length - 1 - i) / f);
  return y;
}
const toMp3 = (x, kbps = 48) => { const s16 = Int16Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
  return execFileSync(FF, ['-v', 'error', '-f', 's16le', '-ar', String(SR), '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', `${kbps}k`, '-f', 'mp3', '-'], { input: Buffer.from(s16.buffer), maxBuffer: 1 << 28 }); };

if (!KEY && !has('list')) { console.error('要先设置环境变量 MIMO_API_KEY（在 MiMo 开放平台控制台创建）。'); process.exit(1); }

// ---- 设计音色：--design 角色 ----
if (has('design')) {
  const who = arg('design'), V = VOICES[who], n = +arg('n', 3), dir = resolve(ROOT, 'out/voice-design'); mkdirSync(dir, { recursive: true });
  if (!V) { console.error('没有这个角色：', who, Object.keys(VOICES)); process.exit(1); }
  for (let i = 1; i <= n; i++) { const wav = await tts('mimo-v2.5-tts-voicedesign', V.sample, V.design);
    const f = resolve(dir, `${who}-${i}.mp3`); writeFileSync(f, toMp3(polish(toF32(wav)), 128)); console.log('候选：', f); }
  console.log(`挑一条满意的，复制成 tools/voices/${who}.mp3，再跑一次 node tools/voice.mjs。`); process.exit(0);
}

// ---- 取全片台词 ----
const { browser, page } = await openFilm();
const lines = await page.evaluate(() => SCENES.flatMap(s => (s.lines || []).map(l => ({ text: l[2], who: (l[3] || {}).who || 'patchouli', mood: (l[3] || {}).mood || '' }))));
await browser.close();
const prompt = l => VOICES[l.who].style + (MOODS[l.mood] ? `这一句${MOODS[l.mood]}。` : '');
if (has('list')) { for (const l of lines) console.log(`[${l.who}] ${l.text}\n  语气：${prompt(l)}${say(l.text) !== l.text ? `\n  送去合成：${say(l.text)}` : ''}`); process.exit(0); }

// ---- 合成 ----
const cacheDir = resolve(ROOT, 'out/voice-cache'); mkdirSync(cacheDir, { recursive: true });
const refs = {}; for (const who of new Set(lines.map(l => l.who))) { const f = resolve(ROOT, `tools/voices/${who}.mp3`);
  if (!VOICES[who] || !existsSync(f)) { console.error(`缺少 ${who} 的参考音色 tools/voices/${who}.mp3，先跑 --design ${who}`); process.exit(1); }
  const b = readFileSync(f); refs[who] = { url: 'data:audio/mpeg;base64,' + b.toString('base64'), hash: createHash('sha1').update(b).digest('hex').slice(0, 10) }; }
const only = arg('only'), seen = new Set(), raw = {};
let done = 0, fresh = 0;
for (const l of lines) {
  if (seen.has(l.text)) continue; seen.add(l.text);
  const user = prompt(l), text = say(l.text), model = 'mimo-v2.5-tts-voiceclone';
  const key = createHash('sha1').update([model, refs[l.who].hash, user, text].join('\n')).digest('hex').slice(0, 16), f = resolve(cacheDir, key + '.wav');
  const redo = has('redo') && (!only || l.text.includes(only));
  if (!existsSync(f) || redo) { process.stdout.write(`合成 [${l.who}] ${l.text}\n`); writeFileSync(f, await tts(model, text, user, refs[l.who].url)); fresh++; }
  raw[l.text] = polish(toF32(readFileSync(f), VOICES[l.who].tempo)); done++;
}
// 30fps 响度包络（全片最大值 = 9 档），给角色按真实语音张嘴
const VOICE = {}, hop = SR / 30; let peak = 0; const envs = {};
for (const [t, x] of Object.entries(raw)) { const e = []; for (let i = 0; i * hop < x.length; i++) { let s = 0; const a = i * hop, b = Math.min(x.length, a + hop); for (let j = a; j < b; j++) s += x[j] * x[j]; const r = Math.sqrt(s / Math.max(1, b - a)); e.push(r); peak = Math.max(peak, r); } envs[t] = e; }
for (const [t, x] of Object.entries(raw)) VOICE[t] = { d: +(x.length / SR).toFixed(3), env: envs[t].map(r => Math.min(9, Math.round(r / peak * 12))).join(''), mp3: toMp3(x).toString('base64') };
const js = `'use strict';\n// 由 tools/voice.mjs 生成，别手改。配音：小米 MiMo TTS v2.5（voiceclone，参考音色 tools/voices/）。每句 { d 秒, env 30fps 响度 0-9, mp3 base64 }\nconst VOICE = ${JSON.stringify(VOICE)};\n`;
writeFileSync(resolve(ROOT, 'src/voice-data.js'), js);
console.log(`src/voice-data.js：${done} 句（新合成 ${fresh} 句），${(js.length / 1024).toFixed(0)} KB，共 ${Object.values(VOICE).reduce((a, v) => a + v.d, 0).toFixed(0)} 秒`);
