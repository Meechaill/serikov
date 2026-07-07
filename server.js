import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// Сканер папок с медиа: кладёте фото (.png/.jpg/.webp/.gif) или видео
// (.mp4/.webm/.mov) — они подхватываются автоматически, без правки кода.
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov']);

function readMediaFolder(baseDir, urlBase, folder) {
  const dir = path.join(baseDir, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((file) => {
      const ext = path.extname(file).toLowerCase();
      const type = IMAGE_EXT.has(ext) ? 'image' : VIDEO_EXT.has(ext) ? 'video' : null;
      if (!type) return null;
      return {
        url: urlBase + '/' + folder + '/' + encodeURIComponent(file),
        type,
        caption: path.basename(file, ext).replace(/[-_]+/g, ' ').trim(),
        mtime: fs.statSync(path.join(dir, file)).mtimeMs
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.mtime - b.mtime); // по порядку добавления — как слайды одной истории
}

// Лента новостей: содержимое папок assets/images/news/{main,karaganda}.
// Свежие посты (по дате файла) первыми.
const NEWS_DIR = path.join(__dirname, 'assets', 'images', 'news');

function readChannel(folder) {
  const items = readMediaFolder(NEWS_DIR, '/assets/images/news', folder);
  return items.slice().sort((a, b) => b.mtime - a.mtime);
}

function readNews() {
  return { main: readChannel('main'), karaganda: readChannel('karaganda') };
}

app.get('/api/news', (req, res) => {
  res.json(readNews());
});

// «Стикеры»-сторис в секции «путь кофе»: assets/images/journey/{farms,
// selection,roasting,check,coffee}. Кладите туда фото/видео каждого шага —
// внутри стикера они будут крутиться, а по клику открываются на весь экран
// с листанием, как сторис в Instagram.
const JOURNEY_DIR = path.join(__dirname, 'assets', 'images', 'journey');
const JOURNEY_FOLDERS = ['farms', 'selection', 'roasting', 'check', 'coffee'];

function readJourneyMedia() {
  const result = {};
  JOURNEY_FOLDERS.forEach((f) => {
    result[f] = readMediaFolder(JOURNEY_DIR, '/assets/images/journey', f);
  });
  return result;
}

app.get('/api/journey-media', (req, res) => {
  res.json(readJourneyMedia());
});

// На статических хостингах (Netlify, GitHub Pages и т.п.) этот сервер не
// запускается — там отдаются только файлы, без /api/*. Поэтому при каждом
// старте сервера (то есть при каждой локальной проверке перед деплоем)
// заодно записываем те же самые данные как обычные .json-файлы —
// фронтенд (news.js, journey-stories.js) сначала пробует их, и только если
// их нет — стучится в /api/* (это и есть режим локальной разработки).
const DATA_DIR = path.join(__dirname, 'assets', 'data');

function writeStaticManifests() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'news.json'), JSON.stringify(readNews()));
  fs.writeFileSync(path.join(DATA_DIR, 'journey-media.json'), JSON.stringify(readJourneyMedia()));
}

app.listen(PORT, () => {
  writeStaticManifests();
  console.log(`Сайт доступен по адресу: http://localhost:${PORT}`);
  console.log('Статические assets/data/*.json обновлены — их нужно закоммитить/загрузить вместе с проектом, чтобы медиа работало и на статическом хостинге (Netlify и т.п.).');
});
