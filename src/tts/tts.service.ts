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

    const key = crypto
      .createHash('sha256')
      .update(`${text}-${languageCode}`)
      .digest('hex');

    const fileName = `${key}.mp3`;
    const filePath = join(audioDir, fileName);

    if (existsSync(filePath)) {
      return fileName;
    }

    // const res = await fetch(
    //   `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-tts:generateContent`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'x-goog-api-key': process.env.GOOGLE_API!,
    //     },
    //     body: JSON.stringify({
    //       contents: [{ parts: [{ text }] }],
    //       generationConfig: {
    //         responseModalities: ['AUDIO'],
    //         speechConfig: {
    //           voiceConfig: {
    //             prebuiltVoiceConfig: { voiceName: 'Achernar' },
    //           },
    //         },
    //       },
    //     }),
    //   },
    // );

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            text,
          },
          voice: {
            languageCode,
            // name: 'en-US-Wavenet-D',
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

    const path = `./public/tts/${fileName}`;

    await fs.writeFile(path, bufferFile);

    return fileName;
  }

  // async saveTtsToFile(
  //   text: string,
  //   languageCode: string,
  //   fileName: string,
  // ): Promise<void> {

  // }

  async deleteSoundUrl(soundUrl: string): Promise<void> {
    const path = `./public/tts/${soundUrl}`;
    if (existsSync(path)) {
      await fs.unlink(path);
    }
  }
}
