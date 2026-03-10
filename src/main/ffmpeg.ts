import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export function convertWebmToMp4(
  inputPath: string,
  outputDir: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputPath = path.join(outputDir, `Videso-${timestamp}.mp4`);

    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-crf 23',
        '-preset fast',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-c:a aac',
        '-b:a 128k',
      ])
      .output(outputPath)
      .on('progress', (info) => {
        if (onProgress && info.percent) {
          onProgress(Math.min(100, Math.round(info.percent)));
        }
      })
      .on('end', () => {
        // Clean up temp WebM
        fs.unlink(inputPath, () => {});
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}
