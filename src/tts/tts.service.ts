import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class TtsService {
  async synthesizeText(text: string, languageCode: string): Promise<string> {
    const audioDir = join(process.cwd(), 'public', 'tts');
    if (!existsSync(audioDir)) {
      mkdirSync(audioDir, { recursive: true });
    }

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1,
          },
        }),
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`TTS failed: ${errorText}`);
    }

    const data = await res.json();

    const bufferFile = Buffer.from(data.audioContent, 'base64');

    const key = crypto
      .createHash('sha256')
      .update(`${text}-${languageCode}`)
      .digest('hex');
    const path = `./public/tts/${key}.mp3`;

    await fs.writeFile(path, bufferFile);

    return `${key}.mp3`;
  }
}
