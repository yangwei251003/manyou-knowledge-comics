import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile, rename} from 'node:fs/promises';
import path from 'node:path';
import {chapters} from '../content/courses.js';
import {storyFor} from '../content/stories/index.js';

const root = path.resolve(import.meta.dirname, '..');
const artworkIndex = path.join(root, 'content', 'chapter-comic-art.json');
const ffmpeg = process.env.FFMPEG_BIN || 'ffmpeg';
const inputFile = process.argv[2];
if (!inputFile) throw new Error('Usage: node scripts/register-chapter-comics.mjs <reviewed-images.json>');
const approved = JSON.parse(await readFile(inputFile, 'utf8'));
const index = {generator: 'built-in image_gen', artworks: {}};
try {
  index.artworks = JSON.parse(await readFile(artworkIndex, 'utf8')).artworks;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
await mkdir(path.join(root, 'assets/comics/chapters'), {recursive: true});
await mkdir(path.join(root, 'production/prompts/chapter-comics'), {recursive: true});

async function encodeWebp(source, file, quality, filter = []) {
  const output = path.join(root, file);
  const temporary = `${output}.tmp.webp`;
  execFileSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', source, ...filter,
    '-frames:v', '1', '-c:v', 'libwebp', '-quality', String(quality),
    '-compression_level', '5', temporary
  ]);
  const webp = await readFile(temporary);
  await rename(temporary, output);
  return {file, bytes: webp.length, sha256: hash(webp)};
}

async function register({id, source, prompt, review, panels}) {
  const chapter = chapters.find(chapter => chapter.id === id);
  const story = chapter && storyFor(chapter);
  if (!story || !prompt?.trim() || !review?.trim()) {
    throw new Error(`Missing story, original prompt or review for ${id}`);
  }
  const png = await readFile(source);
  if (png.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw new Error(`Expected ImageGen PNG for ${id}`);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const panelBounds = panels ?? JSON.parse(execFileSync('python', [
    path.join(root, 'scripts/read-comic-panels.py'),
    source, String(story.columns), String(story.rows)
  ], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}));
  if (panelBounds.length !== story.panels.length || panelBounds.some(
    ([x0, y0, x1, y1]) => x0 < 0 || y0 < 0 || x1 > width || y1 > height || x1 <= x0 || y1 <= y0
  )) throw new Error(`Invalid panel bounds for ${id}`);
  const originalSha256 = hash(png);
  const name = `${id}-${originalSha256.slice(0, 10)}`;
  const file = `assets/comics/chapters/${name}.webp`;
  const promptFile = `production/prompts/chapter-comics/${name}.txt`;

  // Transcode for web delivery. Keep the generated PNG intact in its original location.
  const webp = await encodeWebp(source, file, 90);
  const preview = await encodeWebp(source, `assets/comics/chapters/${name}-preview.webp`, 79, ['-vf', 'scale=480:-2']);
  await writeFile(path.join(root, promptFile), prompt + '\n');
  index.artworks[id] = {
    ...webp,
    width,
    height,
    originalSha256,
    preview,
    prompt: promptFile,
    panelBounds,
    sectionIds: chapter.sections.map(section => section.id),
    review
  };
  console.log(`${id} ${story.panels.length} panels ${file} ${webp.bytes} bytes, preview ${preview.bytes} bytes`);
}

for (const item of approved) {
  try {
    await register(item);
  } catch (error) {
    console.error(`${item.id}: ${error.stderr?.trim().split('\n').at(-1) || error.message}`);
    process.exitCode = 1;
  }
}

index.artworks = Object.fromEntries(Object.entries(index.artworks).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(`${artworkIndex}.tmp`, JSON.stringify(index, null, 2) + '\n');
await rename(`${artworkIndex}.tmp`, artworkIndex);
