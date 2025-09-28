import { PrismaClient } from '@prisma/client';
import languages from './list.json';

const prisma = new PrismaClient();

type IVoice = {
  name: string;
  languageCodes: string[];
  ssmlGender: string;
  naturalSampleRateHertz: number;
};

async function loadGoogleVoices() {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/voices?key=${process.env.GOOGLE_API}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Get voices failed: ${errorText}`);
  }

  const data: {
    voices: Array<IVoice>;
  } = await res.json();

  return data.voices;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing languages first
  console.log('🧹 Clearing existing languages...');

  await prisma.language.deleteMany({});
  console.log('✅ Existing languages cleared');

  const voices = await loadGoogleVoices();

  console.log('🎉 Loaded voices!');

  // Seed languages - comprehensive list of world languages
  console.log('📚 Seeding languages...');

  for (const language of languages) {
    const languageVoices = voices.filter((voice) => {
      return voice.languageCodes.includes(language.code);
    });

    const googleTtsVoiceFemaleName = languageVoices.filter(
      (voice) => voice.ssmlGender === 'FEMALE',
    );

    const googleTtsVoiceMaleName = languageVoices.filter(
      (voice) => voice.ssmlGender === 'MALE',
    );

    if (
      googleTtsVoiceFemaleName.length <= 0 &&
      googleTtsVoiceMaleName.length <= 0
    ) {
      console.log(`🧹 Skip language ${language.name} (${language.code})`);
      continue;
    }

    const hightToLowQualityVoices = [
      'preview',
      'polyglot',
      'studio',
      'neural',
      'wavenet',
      'standard',
    ];

    function getVoiceQuality(voices: IVoice[]): string | undefined {
      if (voices.length === 0) return undefined;
      for (const quality of hightToLowQualityVoices) {
        const found = voices.find((voice) =>
          voice.name.toLowerCase().includes(quality),
        );
        if (found) {
          return found.name;
        }
      }
      return voices[voices.length - 1].name;
    }

    try {
      await prisma.language.create({
        data: {
          ...language,
          googleTtsVoiceFemaleName: getVoiceQuality(googleTtsVoiceFemaleName),
          // googleTtsVoiceFemaleName[googleTtsVoiceFemaleName.length - 1]?.name,
          googleTtsVoiceMaleName: getVoiceQuality(googleTtsVoiceMaleName),
          // googleTtsVoiceMaleName[googleTtsVoiceMaleName.length - 1]?.name,
        },
      });
      console.log(`✅ Language ${language.name} (${language.code}) seeded`);
    } catch (error) {
      console.error(`❌ Failed to seed language ${language.name}:`, error);
      throw error;
    }
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
