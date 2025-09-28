import { PrismaClient } from '@prisma/client';
import languages from './list.json';
import { getVoiceQuality } from './getVoiceQuality';
import { loadGoogleVoices } from './loadGoogleVoices';

const prisma = new PrismaClient();

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

    try {
      await prisma.language.create({
        data: {
          ...language,
          googleTtsVoiceFemaleName: getVoiceQuality(googleTtsVoiceFemaleName),
          googleTtsVoiceMaleName: getVoiceQuality(googleTtsVoiceMaleName),
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
