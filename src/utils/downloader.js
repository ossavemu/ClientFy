import { downloadMediaMessage } from '@adiwajshing/baileys';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import mime from 'mime-types';
import fetch from 'node-fetch';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const formats = {
  mp3: {
    code: 'libmp3lame',
    ext: 'mp3',
  },
};

const convertAudio = async (filePath, format = 'mp3') => {
  if (!filePath) throw new Error('No file path provided');
  const convertedFilePath = path.join(
    path.dirname(filePath),
    `${path.basename(filePath, path.extname(filePath))}.${formats[format].ext}`
  );
  await new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .audioCodec(formats[format].code)
      .audioBitrate('128k')
      .format(formats[format].ext)
      .output(convertedFilePath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
  return convertedFilePath;
};

export const downloadFile = async (url, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }

  const urlExtension = path.extname(url).slice(1);
  const mimeType = res.headers.get('content-type');
  const extension = mime.extension(mimeType) || urlExtension || 'bin';

  const fileName = `file-${Date.now()}.${extension}`;
  const folderPath = path.join(process.cwd(), 'public');
  const filePath = path.join(folderPath, fileName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileStream = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', (err) => {
      reject(err);
    });
    fileStream.on('finish', function () {
      resolve();
    });
  });

  const audioExtensions = ['mp3', 'wav', 'ogg', 'oga'];

  let finalFilePath = filePath;
  let finalExtension = extension;

  if (audioExtensions.includes(extension)) {
    try {
      finalFilePath = await convertAudio(filePath, 'mp3');
      finalExtension = 'mp3';
    } catch (err) {
      console.error('Error converting audio:', err.message);
    }
  }

  return {
    fileName: path.basename(finalFilePath),
    fileOldPath: filePath,
    filePath: finalFilePath,
    fileBuffer: fs.readFileSync(finalFilePath),
    extension: finalExtension,
  };
};

export const downloadFileBaileys = async (ctx) => {
  const buffer = await downloadMediaMessage(ctx, 'buffer');
  const tmpDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const fileName = `file-${Date.now()}.ogg`;
  const filePath = path.join(tmpDir, fileName);
  await fs.promises.writeFile(filePath, buffer);

  const audioExtensions = ['mp3', 'wav', 'ogg', 'oga'];
  let finalFilePath = filePath;
  let finalExtension = 'ogg';

  if (audioExtensions.includes(finalExtension)) {
    try {
      finalFilePath = await convertAudio(filePath, 'mp3');
      finalExtension = 'mp3';
    } catch (err) {
      console.error('Error converting audio:', err.message);
    }
  }

  return {
    fileName: path.basename(finalFilePath),
    fileOldPath: filePath,
    filePath: finalFilePath,
    fileBuffer: fs.readFileSync(finalFilePath),
    extension: finalExtension,
  };
};

export default { downloadFile, downloadFileBaileys };
