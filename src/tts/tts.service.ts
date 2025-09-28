import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class TtsService {
  async synthesizeText(args: {
    text: string;
    languageCode: string;
    gender?: 'male' | 'female';
    name?: string;
  }): Promise<string> {
    const audioDir = join(process.cwd(), 'public', 'tts');
    if (!existsSync(audioDir)) {
      mkdirSync(audioDir, { recursive: true });
    }

    const key = crypto
      .createHash('sha256')
      .update(`${args.text}-${args.languageCode}-${args.gender ?? 'female'}`)
      .digest('hex');

    const fileName = `${key}.mp3`;
    const filePath = join(audioDir, fileName);

    if (existsSync(filePath)) {
      return fileName;
    }

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${process.env.GOOGLE_API}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            text: args.text,
          },
          voice: {
            languageCode: args.languageCode,
            ssmlGender: args.gender,
            name: args.name,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.8,
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

    const path = `./public/tts/${fileName}`;

    await fs.writeFile(path, bufferFile);

    return fileName;
  }

  async deleteSoundUrl(soundUrl: string): Promise<void> {
    const path = `./public/tts/${soundUrl}`;
    if (existsSync(path)) {
      await fs.unlink(path);
    }
  }
}
