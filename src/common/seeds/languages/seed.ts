import { PrismaClient } from '@prisma/client';
import languages from './list.json';

const prisma = new PrismaClient();

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
    voices: Array<{
      name: string;
      languageCodes: string[];
      ssmlGender: string;
      naturalSampleRateHertz: number;
    }>;
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

    try {
      await prisma.language.create({
        data: {
          ...language,
          isSupportGoogleTtsVoiceFemaleGender: languageVoices.some(
            (voice) => voice.ssmlGender === 'FEMALE',
          ),
          isSupportGoogleTtsVoiceMaleGender: languageVoices.some(
            (voice) => voice.ssmlGender === 'MALE',
          ),
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
