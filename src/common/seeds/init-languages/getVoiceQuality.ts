import { IVoice } from './loadGoogleVoices';

const hightToLowQualityVoices = [
  'preview',
  'polyglot',
  'studio',
  'neural',
  'wavenet',
  'standard',
  'chirp3-hd',
];

export function getVoiceQuality(voices: IVoice[]): string[] {
  if (voices.length === 0) return [];

  const voicesResult: string[] = [];

  for (const quality of hightToLowQualityVoices) {
    const foundQuality = voices.filter((voice) =>
      voice.name.toLowerCase().includes(quality),
    );

    if (foundQuality.length > 0) {
      voicesResult.push(foundQuality[foundQuality.length - 1].name);
    }
  }

  voicesResult.reverse();

  if (voicesResult.length <= 2) return voicesResult;
  return [voicesResult[0], voicesResult[voicesResult.length - 1]];
}
